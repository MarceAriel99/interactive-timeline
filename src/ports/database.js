// This is not really a port, but it is a way to abstract the database implementation from the rest of the application.
// TODO take it out of the ports folder
import { DBPostgres } from "../adapters/db_postgres.ts";
import { DBSupabase } from "../adapters/db_supabase";

// TODO Should not save the session as a property of the DB class. It should be passed as a parameter to the initialize method.
class DB {

  constructor(session) {
    this.session = session;
    this.db = null;
  }

  async initialize() {
    console.log("initialize DB");
    console.log("Current environment:", process.env.REACT_APP_CURRENT_ENV);
    if (process.env.REACT_APP_CURRENT_ENV === "production") {
      console.log("Using Supabase");
      this.db = new DBSupabase(this.session);
      await this.db.initialize();
    } else if (process.env.REACT_APP_CURRENT_ENV === "development") {
      console.log("Using Postgres");
      this.db = new DBPostgres();
      await this.db.initialize();
    } else {
      throw new Error("Invalid REACT_APP_CURRENT_ENV");
    }
    console.log("DB initialized");
  }

  async isInitialized() {
    return this.db !== null;
  }
}

export default DB;