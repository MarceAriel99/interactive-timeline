import React from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';
import DB from './ports/database';
import EventsCRUDComponent from './components/EventsCRUD.js';
import EventRepository from './repositories/event_repository.js';

function App() {
  const { session, loading, handleSignIn, handleSignOut } = useAuth();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [database, setDatabase] = useState(null);

  useEffect(() => {
    if (session) {
      const db = new DB(session);
      db.initialize().then(() => {
        setDatabase(db);
        setDbInitialized(true);
      }).catch(error => {
        console.error("Database initialization failed:", error);
      });
    }
  }, [session]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Interactive Timeline</h1>
      </header>
      <section className='App-body'>
        {session ? (
          <>
            <h1>Welcome, {session.user.user_metadata.full_name.split(' ')[0]}</h1>
            <button onClick={handleSignOut}>Sign Out</button>
            {dbInitialized ?
              <EventsCRUDComponent eventRepository={new EventRepository(database)} />
              : <p>Initializing database...</p>
            }
          </>
        ) : (
          <button onClick={handleSignIn}>Sign In with Google</button>
        )}
      </section>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}