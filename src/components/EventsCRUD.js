// EventsCRUDComponent.js

import React, { useState, useEffect } from 'react';
import Event from '../model/event';

function EventsCRUDComponent({ eventRepository }) {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState(new Event('', '', '', ''));
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
      console.log('Creating event:', newEventToSave);
			const createdEvent = await eventRepository.saveEvent(newEventToSave);
			console.log('Created event:', createdEvent);
      setEvents([...events, createdEvent]);
      setNewEvent(new Event('', '', '', '')); // Reset fields
    } catch (error) {
      console.error('Error creating event:', error);
			setErrorMessage(error.message);
    }
  };

  const handleUpdateEvent = async () => {
    if (!checkFields()) return;
    try {
      console.log("Editing event: ", editEvent)
      const updatedEvent = await eventRepository.saveEvent(editEvent);
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
    try {
      console.log('Deleting event with id:', id);
      await eventRepository.deleteEventById(id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleChange = (e) => {
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
          onChange={handleChange}
          placeholder="Title"
        />
        <input
          type="text"
          name="description"
          value={isEditing ? editEvent.description : newEvent.description}
          onChange={handleChange}
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
          value={isEditing ? editEvent.place : newEvent.place}
          onChange={handleChange}
          placeholder="Place"
        />
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
							<button onClick={() => { setEditEvent(event); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' });}}>Edit</button>  
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
