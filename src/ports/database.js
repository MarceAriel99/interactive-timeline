// This is not really a port, but it is a way to abstract the database implementation from the rest of the application.
// TODO take it out of the ports folder
import { DBPostgres } from "../adapters/db_postgres.ts";
import { DBSupabase } from "../adapters/db_supabase";

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

  async getAllRecords(tableName) {
    return this.db.getAllRecords(tableName);
  }

  async getRecordById(tableName, id) {
    return this.db.getRecordById(tableName, id);
  }

  async createRecord(tableName, record) {
    return this.db.createRecord(tableName, record);
  }

  async updateRecord(tableName, id, record) {
    return this.db.updateRecord(tableName, id, record);
  }

  async deleteRecord(tableName, id) {
    return this.db.deleteRecord(tableName, id);
  }

}

export default DB;