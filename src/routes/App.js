import { React, useEffect, useState } from 'react';

import { useAuth } from '../components/AuthProvider.js';
import { useDatabase } from '../components/DatabaseContext.js';

import EventRepository from '../repositories/event_repository.js';

import TimelineComponent from '../components/Timeline.js';
import NavBarComponent from '../components/NavBar.jsx';

import '../css/App.css';

function App() {
  const { session } = useAuth();
  const { database } = useDatabase();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (database) {
      const eventRepository = new EventRepository(database);
      eventRepository.loadAllEvents().then((events) => {
        setEvents(events);
      }).catch((error) => {
        console.error('Error loading events:', error);
      });
    }
  }, [database]);

  return (
    <div className="App">
      <header>
        <NavBarComponent/>
      </header>
      <main className="App-main">
        {session ? (
          <>
            { events.length > 0 ? (
              <TimelineComponent events={events} />
            ) : (
              <p>Loading Events...</p>
            )}
          </>
        ) : (
          <p>Please Sign In to Continue</p>
        )}
      </main>
    </div>
  );
}

export default App;