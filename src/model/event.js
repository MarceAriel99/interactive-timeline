// TODO: Move to typescript or integrate into a React component that also manages creatin and edition
class Event {
  constructor({title='', description='', date='', place='', media=[], new_media=[], id=null}){
    this.title = title; // String
    this.description = description; // String
    this.date = date; // Date
    this.place = place; // String
    this.media = media; // Array of strings (local or remote URLs)
    this.new_media = new_media; // Array of File objects
    this.id = id; // Integer
  }

  addNewMedia(file){
    //console.log("EVENT MODEL");
    //console.log('Adding new media:', file);
    let file_url = URL.createObjectURL(file);
    this.media.push(file_url);
    this.new_media.push(file);
    //console.log('Media:', this.media);
    //console.log('New media:', this.new_media);
  }

  removeMedia(index){
    //console.log("EVENT MODEL");
    //console.log('Removing media at index:', index);
    const initial_media_count = this.media.length;
    const initial_new_media_count = this.new_media.length;
    const old_media_count = initial_media_count - initial_new_media_count;
    // If the media is new, remove it from the new_media array and the media array
    if (index >= old_media_count - 1){
      //console.log('Removing new media');
      //console.log('Media:', this.media);
      //console.log('New media:', this.new_media);
      this.media.splice(index, 1);
      this.new_media.splice(index - old_media_count, 1);
      //console.log('Media after removing:', this.media);
      //console.log('New media after removing:', this.new_media);
    }
    // If the media is old, remove it from the media array
    else{
      //console.log('Removing old media');
      //console.log('Media:', this.media);
      this.media.splice(index, 1);
      //console.log('Media after removing:', this.media);
    }
    //console.log("EVENT MODEL");
  }

  getMedia(){
    return this.media;
  }

  getNewMedia(){
    return this.new_media;
  }
}

export default Event;