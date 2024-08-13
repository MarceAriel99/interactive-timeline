import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import DB from '../ports/database';

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
    const { session } = useAuth(); // Get session from AuthContext
    const [database, setDatabase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeDatabase = async () => {
            if (session) {
                // Check if the database is already set
                if (!database) {
                    try {
                        const db = new DB(session);
                        await db.initialize();
                        setDatabase(db);
                        setLoading(false);
                    } catch (error) {
                        console.error("Database initialization failed:", error);
                    }
                } else {
                    setLoading(false); // Set loading to false if the database is already initialized
                }
            } else {
                setDatabase(null);
                setLoading(false);
            }
        };

        initializeDatabase();
    }, [session]);

    return (
        <DatabaseContext.Provider value={{ database }}>
            {children}
        </DatabaseContext.Provider>
    );
}

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
      throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};