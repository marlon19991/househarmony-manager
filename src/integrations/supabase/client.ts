import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pyepibmlwqjeeaakzsfl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZXBpYm1sd3FqZWVhYWt6c2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTgzMzEsImV4cCI6MjA1MDEzNDMzMX0.TqwEKunFBWTtTlBlHto7E7O0TVEQc6A1fi40G8v8m1Y";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);