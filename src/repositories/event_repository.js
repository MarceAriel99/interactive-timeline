import Event from '../model/event.js';

class EventRepository{

    static EVENTS_TABLE = 'events';

    constructor(database){
        this.database = database;
    }

    async loadAllEvents(){
        let records = await this.database.getAllRecords(EventRepository.EVENTS_TABLE);
        return records.map(record => new Event(record.title, record.description, this._obtainDate(record.date), record.place, record.id));
    }

    async loadEventById(id){
        let record = await this.database.getRecordById(EventRepository.EVENTS_TABLE, id);
        return new Event(record.title, record.description, this._obtainDate(record.date), record.place, record.id);
    }

    async deleteEventById(id){
        return await this.database.deleteRecord(EventRepository.EVENTS_TABLE, id);
    }

    async saveEvent(event){
        let record;
        if (!event.id){
            // Remove id from event object
            delete event.id;
            record = await this.database.createRecord(EventRepository.EVENTS_TABLE, event);
        }
        else{
            record = await this.database.updateRecord(EventRepository.EVENTS_TABLE, event.id, event);
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