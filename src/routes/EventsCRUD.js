import { useAuth } from '../components/AuthProvider.js';
import { useDatabase } from '../components/DatabaseContext.js';

import EventRepository from '../repositories/event_repository.js';

import NavBarComponent from '../components/NavBar.jsx';
import EventsCRUDComponent from '../components/EventsCRUD.js';

function EventsCRUD() {
  const { session } = useAuth();
  const { database, loading } = useDatabase();

  return (
    <div className="App">
      <header>
        <NavBarComponent/>
      </header>
      <main className="App-main">
        {session ? (
          <>
            {loading ? (
              <p>Initializing Database...</p>
            ) : database ? (
              <EventsCRUDComponent eventRepository={new EventRepository(database)} />
            ) : (
              <p>Database not available.</p>
            )}
          </>
        ) : (
          <p>Please Sign In to Continue</p>
        )}
      </main>
    </div>
  );
}

export default EventsCRUD;