import { createClient } from '@supabase/supabase-js';
    
// Create a single instance of Supabase client
const supabase = process.env.REACT_APP_CURRENT_ENV === "development" ? null : createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

export default supabase;
