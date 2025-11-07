-- Migración para corregir el tipo de datos de notification_time en recurring_tasks
-- Esta migración corrige el error al insertar valores de tiempo

-- Primero, eliminar la columna 'time' que no se está usando
ALTER TABLE recurring_tasks DROP COLUMN IF EXISTS time;

-- Cambiar notification_time de TIMESTAMP WITH TIME ZONE a TIME
ALTER TABLE recurring_tasks
  ALTER COLUMN notification_time TYPE TIME USING notification_time::TIME;

-- Comentario actualizado
COMMENT ON COLUMN recurring_tasks.notification_time IS 'Hora de notificación para la tarea (formato HH:MM)';
