class Event {
  constructor(title, description, date, place, id=null) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.place = place;
    this.id = id;
  }
}

export default Event;