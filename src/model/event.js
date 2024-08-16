class Event {
  constructor(title, description, date, place, media=null, id=null) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.place = place;
    this.media = media;
    this.id = id;
  }
}

export default Event;