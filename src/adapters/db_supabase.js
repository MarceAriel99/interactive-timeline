import supabase from "../supabase/supabaseClient";

export class DBSupabase {

  async initialize() {
    this.supabase = supabase;
  }

  constructor(session) {
    this.session = session;
  }

  async getAllRecords(tableName, orderBy=null, order=null) {
    
    if (orderBy) {
      let { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .order(orderBy, { ascending: order === 'DESC' ? false : true })
      if (error) {
        console.error('Error getting all records:', error.message);
        throw error;
      }
      return data;
    }

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

  async uploadFile(file) {
    console.log('Uploading file SUPA:', file);

    const { data, error } = await this.supabase.storage
      .from('interactive_timeline_media')
      .upload(file.name, file)
    if (error) {
      console.error('Error uploading file:', error.message)
      throw error
    }

    console.log('Uploaded file SUPA:', data);
    
    // Get the signed URL for the uploaded file (valid for 5 years)
    const signedUrl = await this.getSignedUrl(file.name)
    console.log('Signed URL:', signedUrl)
    return signedUrl
  }

  async getSignedUrl(file_name) {
    const { data, error } = await this.supabase.storage
      .from('interactive_timeline_media')
      .createSignedUrl(file_name, 157680000)
    if (error) {
      console.error('Error getting signed URL:', error.message)
      throw error
    }
    return data.signedUrl
  }

  async deleteFile(file_name) {

    console.log("DELETE FILE SUPA: ", file_name);
      
    const { data, error } = await this.supabase.storage
      .from('interactive_timeline_media')
      .remove([file_name])
    if (error) {
      console.error('Error deleting file:', error.message)
      throw error
    }

    console.log('Deleted file SUPA:', data);

    return data
  }

  async createEventTransaction(event, new_media) {
      
    let { data, error } = await this.supabase.rpc('create_event', { event, new_media })
    if (error) {
      console.error('Error creating event transaction:', error.message)
      throw error
    }
    return data
  }
}