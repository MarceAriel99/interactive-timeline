import supabase from "../supabase/supabaseClient";

export class DBSupabase {

  async initialize() {
    this.supabase = supabase;
  }

  constructor(session) {
    this.session = session;
  }

  async getAllRecords(tableName) {
    let { data, error } = await this.supabase
      .from(tableName)
      .select('*')
    if (error) {
      console.error('Error getting all records:', error.message);
      throw error;
    }

    return data;
  }

  async getRecordById(tableName, id) {

    let { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
    if (error) {
      console.error('Error getting record:', error.message)
      throw error
    }
    return data ? data[0] : null;
  }

  async createRecord(tableName, record) {

    let { data, error } = await this.supabase
      .from(tableName)
      .insert(record)
      .select()
    if (error) {
      console.error('Error creating record:', error.message)
      throw error
    }
    return data ? data[0] : null;
  }

  async updateRecord(tableName, id, record) {

    let { data, error } = await this.supabase
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
    if (error) {
      console.error('Error updating record:', error.message)
      throw error
    }
    return data ? data[0] : null;
  }

  async deleteRecord(tableName, id) {

    let { data, error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select()
    if (error) {
      console.error('Error deleting record:', error.message)
      throw error
    }
    return data
  }

}