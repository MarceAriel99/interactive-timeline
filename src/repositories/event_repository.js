import Event from '../model/event.js';

class EventRepository{

    static EVENTS_TABLE = 'events';
    static EVENTS_MEDIA_TABLE = 'events_media';

    constructor(database){
        this.database = database;
    }

    async loadAllEvents(){
        let events_records = await this.database.db.getAllRecords(EventRepository.EVENTS_TABLE, 'date');
        let events_promises = events_records.map(async event_record => {
            return await this._obtainEventFromRecord(event_record);
        });
        let events = await Promise.all(events_promises);
        return events
    }

    async loadEventById(id){
        let event = await this.database.db.getRecordById(EventRepository.EVENTS_TABLE, id);
        
        return this._obtainEventFromRecord(event);
    }

    async deleteEventById(id){
        const media = await this._obtainMediaForEvent(id);
        media.forEach(async media_url => {
            await this.database.db.deleteFile(media_url.split('/').pop());
        });
        return await this.database.db.deleteRecord(EventRepository.EVENTS_TABLE, id);
    }

    async saveEvent(event){
        console.log("Saving event: ", event);

        // Create a copy of the event object
        event = { ...event };

        // Get media from event object
        let media = event.media;
        let new_media = event.new_media;

        // Remove media from event object (these are not fields in the events table)
        delete event.media;
        delete event.new_media;

        // Change file names (get file and add timestamp to avoid duplicates)
        new_media = new_media.map((file, index) => {
            // Convert event title to lowercase and replace spaces with underscores
            const title = event.title.toLowerCase().replace(/ /g, '_') + '_' + Date.now() + '_' + index + '.' + file.type.split('/')[1];
            return new File([file], title, { type: file.type });
        });

        return event.id ? await this._saveExistingEvent(event, media, new_media) : await this._saveNewEvent(event, new_media);
    }

    async _saveNewEvent(event, new_media) {

        let event_to_return;
        let event_record;

        // Remove id from event object
        delete event.id;

        try {
            event_record = await this.database.db.createRecord(EventRepository.EVENTS_TABLE, event);
        } catch (error) {
            return new EventRepositoryResult({ success: false, message: 'Error creating event: ' + error.message, messageType: MessageTypes.ERROR });
        }

        let uploadResult = await this._uploadMediaForEvent(event_record, new_media);

        // Check if any of the media uploads failed
        let failedUploads = uploadResult.filter(promise => promise.status === 'rejected');

        if (failedUploads.length > 0) {
            let errorMessages = "Error uploading media, " + failedUploads.map(promise => promise.reason.message).join(', ');
            event_to_return = await this._obtainEventFromRecord(event_record);
            return new EventRepositoryResult({ success: true, data: event_to_return, message: 'Event created with warnings: ' + errorMessages, messageType: MessageTypes.WARNING });
        }

        try {
            event_to_return = await this._obtainEventFromRecord(event_record);
            return new EventRepositoryResult({ success: true, data: event_to_return, message: 'Event created successfully', messageType: MessageTypes.OK });
        } catch (error) {
            return new EventRepositoryResult({ success: false, message: 'Error creating event: ' + error.message, messageType: MessageTypes.ERROR });
        }
    }

    async _saveExistingEvent(event, media, new_media){
        console.log("Saving existing event: ", event);

        let errorMessages = '';
        let event_to_return;
        let event_record;

        // Update the event record in the database
        try {
            event_record = await this.database.db.updateRecord(EventRepository.EVENTS_TABLE, event.id, event);
        } catch (error) {
            return new EventRepositoryResult({ success: false, message: 'Error updating event: ' + error.message, messageType: MessageTypes.ERROR });
        }

        // Get the media that is saved in the database
        let saved_media_urls = await this._obtainMediaForEvent(event.id);

        // Compare the media in the database with the media in the event object
        let media_to_delete = saved_media_urls.filter(url => !media.includes(url));
        let media_to_upload = new_media;

        //console.log("Media to delete: ", media_to_delete);
        //console.log("Media to upload: ", media_to_upload);

        let deleteResult = await this._deleteMediaByURL(media_to_delete);

        // Check if any of the media deletions failed
        let failedDeletions = deleteResult.filter(promise => promise.status === 'rejected');

        if (deleteResult.filter(promise => promise.status === 'rejected').length > 0) {
            errorMessages += "Error deleting media, " + failedDeletions.map(promise => promise.reason.message).join(', ');
        }

        let uploadResult = await this._uploadMediaForEvent(event_record, media_to_upload);

        // Check if any of the media uploads failed
        let failedUploads = uploadResult.filter(promise => promise.status === 'rejected');

        if (failedUploads.length > 0) {
            errorMessages += "Error uploading media, " + failedUploads.map(promise => promise.reason.message).join(', ');
        }

        // If there were any errors, return the event with the errors
        if (errorMessages) {
            event_to_return = await this._obtainEventFromRecord(event_record);
            return new EventRepositoryResult({ success: true, data: event_to_return, message: 'Event updated with warnings: ' + errorMessages, messageType: MessageTypes.WARNING });
        }

        // If there were no errors, return the event
        try {
            event_to_return = await this._obtainEventFromRecord(event_record);
            return new EventRepositoryResult({ success: true, data: event_to_return, message: 'Event updated successfully', messageType: MessageTypes.OK });
        } catch (error) {
            return new EventRepositoryResult({ success: false, message: 'Error updating event: ' + error.message, messageType: MessageTypes.ERROR });
        }
    }
        
    _convertToDate(record_date){
        const date_without_time = record_date.split('T')[0];
        const date_parts = date_without_time.split('-');
        return new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
    }

    async _obtainMediaForEvent(event_id){
        // TODO: make this more efficient, it is not necessary to load all the media records but only the ones that belong to the event
        let events_media = await this.database.db.getAllRecords(EventRepository.EVENTS_MEDIA_TABLE);
        return events_media.filter(media_record => media_record.timeline_event_id === event_id).map(media_record => media_record.url);
    }

    async _obtainEventFromRecord(record){
        //console.log("Obtaining event from record: ", record);
        let media = await this._obtainMediaForEvent(record.id);
        //console.log("Media for event: ", media);
        return new Event({title: record.title, description: record.description, date: this._convertToDate(record.date), place: record.place, media: media, id: record.id});
    }

    async _uploadMediaForEvent(event_record, new_media){
        
        let uploadPromises = new_media.map(async media => {
            let media_url;
            // TODO: If errors are caught by Promise.allSettled, check if it is necessary to wrap the following code in a try-catch block
            try {
                media_url = await this.database.db.uploadFile(media);
            } catch (error) {
                throw error; // Re-throw error to be handled by Promise.all
            }

            try {
                return await this.database.db.createRecord(EventRepository.EVENTS_MEDIA_TABLE, {
                    timeline_event_id: event_record.id,
                    url: media_url
                });
            } catch (error) {
                await this.database.db.deleteFile(media_url.split('/').pop());
                throw error; // Re-throw error to be handled by Promise.all
            }
        });
        
        // Wait for all media uploads to complete
        return Promise.allSettled(uploadPromises);
    }

    async _deleteMediaByURL(media_urls){

        let deletePromises = media_urls.map(async media_url => {
            // TODO: If errors are caught by Promise.allSettled, check if it is necessary to wrap the following code in a try-catch block
            try {
                // TODO: make this more efficient, it is not necessary to load all the media records but only the one that has the url
                let media_records = await this.database.db.getAllRecords(EventRepository.EVENTS_MEDIA_TABLE);
                let media_to_delete_id = media_records.filter(media_record => media_record.url === media_url)[0].id;
                console.log("Deleting media with id: ", media_to_delete_id);
                await this.database.db.deleteRecord(EventRepository.EVENTS_MEDIA_TABLE, media_to_delete_id);
            } catch (error) {
                console.error("Error deleting media: ", error);
                throw error; // Re-throw error to be handled by Promise.all
            }

            try {
                return await this.database.db.deleteFile(media_url.split('/').pop());
            } catch (error) {
                console.error("Error deleting media: ", error);
                throw error; // Re-throw error to be handled by Promise.all
            }
        });

        // Wait for all media deletions to complete
        return Promise.allSettled(deletePromises);
    }
}

class EventRepositoryResult{
    constructor({success=false, data=null, message='', messageType=MessageTypes.OK}){
        this.success = success;
        this.data = data;
        this.message = message;
        this.messageType = messageType;
    }
}

// TODO: Move to a separate file
const MessageTypes = Object.freeze({
    OK: 'OK',
    WARNING: 'WARNING',
    ERROR: 'ERROR'
});

export default EventRepository;