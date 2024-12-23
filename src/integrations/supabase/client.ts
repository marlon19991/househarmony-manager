import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pyepibmlwqjeeaakzsfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZXBpYm1sd3FqZWVhYWt6c2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMzNDQ3NzAsImV4cCI6MjAxODkyMDc3MH0.SbUXk3ow-4KVvYwTOYgZHxfcy_UVPKUZGqWSrWyrzHE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});