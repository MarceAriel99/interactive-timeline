import React from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider.js';
import { DatabaseProvider, useDatabase } from '../components/DatabaseContext.js';
import { useEffect, useState } from "react";
import '../css/App.css';
import DB from '../ports/database.js';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EventsCRUD from './EventsCRUD';
import EventsCRUDComponent from '../components/EventsCRUD.js';
import EventRepository from '../repositories/event_repository.js';

import TimelineComponent from '../components/Timeline.js';

function App() {
  const { session, handleSignIn, handleSignOut } = useAuth();
  const { database, loading } = useDatabase();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (database) {
      const eventRepository = new EventRepository(database);
      eventRepository.loadAllEvents().then((events) => {
        setEvents(events);
        console.log('Events loaded:', events);
      }).catch((error) => {
        console.error('Error loading events:', error);
      });
    }
  }, [database]);

  return (
    <div className="App">
      <header>
        <a href="/"><h1>Interactive Timeline</h1></a>
        <Link className='App-link' to={'/EventsCRUD'}>Manage Events</Link>
        {session ? (
          <div className="header-auth">
            <p>Welcome, {session.user.user_metadata.full_name.split(' ')[0]}!</p>
            <img src={session.user.user_metadata.avatar_url} alt="User Avatar" />
            <button className="header-auth-signout_button" onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button className="header-auth gsi-material-button" onClick={handleSignIn}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google</span>
              <span style={{ display: 'none' }}>Sign in with Google</span>
            </div>
          </button>
        )
        }
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