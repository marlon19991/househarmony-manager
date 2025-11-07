import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Obtener variables de entorno con valores por defecto para desarrollo
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pyepibmlwqjeeaakzsfl.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZXBpYm1sd3FqZWVhYWt6c2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTgzMzEsImV4cCI6MjA1MDEzNDMzMX0.TqwEKunFBWTtTlBlHto7E7O0TVEQc6A1fi40G8v8m1Y";

// Validar que las variables de entorno estén definidas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan las variables de entorno de Supabase: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

// Crear cliente de Supabase con mejores prácticas
// Configuración optimizada según documentación oficial
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    // Configurar heartbeat para mantener conexión activa
    heartbeatIntervalMs: 30000,
  },
  // Habilitar sincronización entre pestañas
  multiTab: true,
  // Configurar fetch personalizado si es necesario
  // fetch: customFetch,
});