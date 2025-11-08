import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Obtener variables de entorno (obligatorias)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

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
