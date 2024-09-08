// EventsCRUDComponent.js

import { React, useState, useEffect } from 'react';
import Event from '../model/event';

function EventsCRUDComponent({ eventRepository }) {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState(new Event({}));
  const [editEvent, setEditEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
	const [error_message, setErrorMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsList = await eventRepository.loadAllEvents();
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!checkFields()) return;
    try {
      const newEventToSave = { ...newEvent, id: null };
      //console.log('Creating event:', newEventToSave);
      const result = await eventRepository.saveEvent(newEventToSave);
			
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      
      const createdEvent = result.data;

      if (result.messageType === 'WARNING') {
        setErrorMessage(result.message);
      }
      
			//console.log('Created event:', createdEvent);
      setEvents([...events, createdEvent]);
      setNewEvent(new Event({}));
    } catch (error) {
      console.error('Error creating event:', error);
			setErrorMessage(error.message);
    }
  };

  const handleUpdateEvent = async () => {
    if (!checkFields()) return;
    try {
      const result = await eventRepository.saveEvent(editEvent);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      const updatedEvent = result.data;

      if (result.messageType === 'WARNING') {
        setErrorMessage(result.message);
      }

      //console.log('Updated event:', updatedEvent);
			// Update the events list with the updated event
			setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
      setEditEvent(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
			setErrorMessage(error.message);
    }
  };

  const handleDeleteEvent = async (id) => {

    // Show confirmation dialog before deleting
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      //console.log('Deleting event with id:', id);
      await eventRepository.deleteEventById(id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleChangeTextField = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditEvent({ ...editEvent, [name]: value });
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const handleChangeDate = (e) => {
    const { name, value } = e.target;
    const date = value ? new Date(value) : null;

    if (isEditing) {
      setEditEvent({ ...editEvent, [name]: date });
    } else {
      setNewEvent({ ...newEvent, [name]: date });
    }
  };

  const handleAddMedia = (e) => {

    //console.log(events);
    const files = Array.from(e.target.files);

    const eventInstance = isEditing ? new Event(editEvent) : new Event(newEvent);

    files.forEach(file => {
      eventInstance.addNewMedia(file);
    });

    // Update state with new data
    if (isEditing) {
      setEditEvent({ ...editEvent, media: eventInstance.getMedia(), new_media: eventInstance.getNewMedia() });
      //console.log('Edit event:', editEvent);
    }
    else {
      setNewEvent({ ...newEvent, media: eventInstance.getMedia(), new_media: eventInstance.getNewMedia() });
      //console.log('New event:', newEvent);
    }
 
    // Clear the input field
    e.target.value = null;
  };

  const handleRemoveMedia = (index) => {
    const eventInstance = isEditing ? new Event(editEvent) : new Event(newEvent);
    // console.log("EVENTS CRUD COMPONENT");
    // console.log('Removing media at index:', index);
    // console.log('Media:', eventInstance.getMedia());
    // console.log('New media:', eventInstance.getNewMedia());
    eventInstance.removeMedia(index);
    // console.log('Media after removing:', eventInstance.getMedia());
    // console.log('New media after removing:', eventInstance.getNewMedia());
    // console.log("EVENTS CRUD COMPONENT");

    // Update state with new data
    if (isEditing) {
      setEditEvent({ ...editEvent, media: eventInstance.getMedia(), new_media: eventInstance.getNewMedia() });
    }
    else {
      setNewEvent({ ...newEvent, media: eventInstance.getMedia(), new_media: eventInstance.getNewMedia() });
    }
  };

  const formatDate = (date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const checkFields = () => {
    // Check if title and date are empty on the new event or the event being edited
    if ((!isEditing && (!newEvent.title || !newEvent.date)) || (isEditing && (!editEvent.title || !editEvent.date))) {
      setErrorMessage('Title and Date fields are required');
      return false;
    }
    setErrorMessage('');
    return true;
  }

  return (
    <div className="events-crud-component">
      <h2>Manage Events</h2>
      
      <div className="event-form">
        <input
          type="text"
          name="title"
          value={isEditing ? editEvent.title : newEvent.title}
          onChange={handleChangeTextField}
          placeholder="Title"
        />
        <input // TODO: Description and place are being saved as empty strings, should be null if not provided
          type="text"
          name="description"
          value={isEditing ? editEvent.description ? editEvent.description : '' : newEvent.description ? newEvent.description : '' }
          onChange={handleChangeTextField}
          placeholder="Description"
        />
        <input
          type="date"
          name="date"
          value={isEditing ? formatDate(editEvent.date) : formatDate(newEvent.date)}
          onChange={handleChangeDate}
          placeholder="Date"
        />
        <input
          type="text"
          name="place"
          value={isEditing ? editEvent.place ? editEvent.place : '' : newEvent.place ? newEvent.place : '' }
          onChange={handleChangeTextField}
          placeholder="Place"
        />
        
        {/* Provide a way to add or remove media (showing the image) */}
        <div className="event-media">
          {isEditing && editEvent.media.map((src, index) => (
            <div key={index}>
              <img key={index} src={src} alt="Event media" />
              <button onClick={() => handleRemoveMedia(index)}>Remove</button>
            </div>
          ))}
          {!isEditing && newEvent.media.map((src, index) => (
            <div key={index}>
              <img key={index} src={src} alt="Event media" />
              <button onClick={() => handleRemoveMedia(index)}>Remove</button>
            </div>
          ))}
          <button onClick={() => document.getElementsByName('media')[0].click()}>Add Media</button>
          <input type="file" name="media" accept="image/webp" style={{display:'none'}} multiple onChange={handleAddMedia} />
        </div>

        <button onClick={isEditing ? handleUpdateEvent : handleCreateEvent}>
          {isEditing ? 'Update Event' : 'Create Event'}
        </button>
				<p className='error-message'> {error_message} </p>
      </div>

      <ul className="events-list">
				{(events.length === 0 || events === null) ?
					<p>No events found</p> 
					:
					<>
					{events.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => (
						<li key={event.id} className="event-item">
							<p className="event-title">
								{"Title: " + event.title}
							</p>
							<p className="event-description">
								{"Description: " + (event.description ? event.description : 'No description')}
							</p>
							<p className="event-date">
								{"Date: " + new Date(event.date).toLocaleDateString('es-ES')}
							</p>
							<p className="event-place">
								{"Place: " + (event.place ? event.place : 'No place')}
							</p>
              <div className="event-media">
                {event.media.map((src, index) => (
                  <img key={index} src={src} alt="Event media" />
                ))}
              </div>
							<button onClick={() => { setEditEvent(event); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); setErrorMessage(''); }}>Edit</button> 
							<button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
						</li>
					))}
					</>
				}
      </ul>
    </div>
  );
}

export default EventsCRUDComponent;
