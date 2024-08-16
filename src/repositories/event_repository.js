import Event from '../model/event.js';

class EventRepository{

    static EVENTS_TABLE = 'events';
    static EVENTS_MEDIA_TABLE = 'events_media';

    constructor(database){
        this.database = database;
    }

    async loadAllEvents(){
        let events = await this.database.db.getAllRecords(EventRepository.EVENTS_TABLE, 'date');
        let events_media = await this.database.db.getAllRecords(EventRepository.EVENTS_MEDIA_TABLE);

        return events.map(record => {
            let media = events_media.filter(media_record => media_record.timeline_event_id === record.id).map(media_record => media_record.media);
            return new Event(record.title, record.description, this._obtainDate(record.date), record.place, media, record.id);
        });
    }

    async loadEventById(id){
        let event = await this.database.db.getRecordById(EventRepository.EVENTS_TABLE, id);
        // TODO: make this more efficient, it is not necessary to load all the media records but only the ones that belong to the event
        let events_media = await this.database.db.getAllRecords(EventRepository.EVENTS_MEDIA_TABLE);
        let media = events_media.filter(media_record => media_record.timeline_event_id === event.id).map(media_record => media_record.media);
        
        return new Event(event.title, event.description, this._obtainDate(event.date), event.place, media, event.id);
    }

    // TODO: delete media records that belong to the event? Or should this be done by the database?
    async deleteEventById(id){
        return await this.database.db.deleteRecord(EventRepository.EVENTS_TABLE, id);
    }

    // TODO: check how media is handled
    async saveEvent(event){
        let record;
        if (!event.id){
            // Remove id from event object
            delete event.id;
            record = await this.database.db.createRecord(EventRepository.EVENTS_TABLE, event);
        }
        else{
            record = await this.database.db.updateRecord(EventRepository.EVENTS_TABLE, event.id, event);
        }
        return new Event(record.title, record.description, this._obtainDate(record.date), record.place, record.id);
    }

    _obtainDate(record_date){
        const date_without_time = record_date.split('T')[0];
        const date_parts = date_without_time.split('-');
        return new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
    }
}

export default EventRepository;