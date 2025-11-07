-- Migración inicial para HouseHarmony Manager
-- Ejecuta este script en tu base de datos PostgreSQL local 'housearmony'

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT '👤',
    email VARCHAR(255),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    selected_profiles TEXT[], -- Array de strings
    split_between INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones de facturas
CREATE TABLE IF NOT EXISTS bill_notifications (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas de limpieza general
CREATE TABLE IF NOT EXISTS general_cleaning_tasks (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    comment TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estados de tareas de limpieza
CREATE TABLE IF NOT EXISTS cleaning_task_states (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL UNIQUE REFERENCES general_cleaning_tasks(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de progreso de limpieza general
CREATE TABLE IF NOT EXISTS general_cleaning_progress (
    id SERIAL PRIMARY KEY,
    assignee VARCHAR(255) NOT NULL UNIQUE,
    completion_percentage INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas periódicas
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL DEFAULT '📅',
    recurrence_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    assignees TEXT[], -- Array de strings
    weekdays BOOLEAN[], -- Array de 7 booleanos (lunes a domingo)
    selected_days TEXT[], -- Array de strings para días específicos
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    specific_day VARCHAR(50), -- Para tareas mensuales
    time TIME,
    notification_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(payment_due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bill_notifications_bill_id ON bill_notifications(bill_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_task_states_task_id ON cleaning_task_states(task_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_recurrence_type ON recurring_tasks(recurrence_type);

-- Trigger para actualizar updated_at en cleaning_task_states
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cleaning_task_states_updated_at 
    BEFORE UPDATE ON cleaning_task_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime para las tablas (requiere Supabase)
-- Si usas PostgreSQL directo, estas líneas no funcionarán
-- ALTER PUBLICATION supabase_realtime ADD TABLE bills;
-- ALTER PUBLICATION supabase_realtime ADD TABLE general_cleaning_tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE cleaning_task_states;
-- ALTER PUBLICATION supabase_realtime ADD TABLE general_cleaning_progress;
-- ALTER PUBLICATION supabase_realtime ADD TABLE recurring_tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Comentarios en las tablas
COMMENT ON TABLE profiles IS 'Perfiles de usuarios/residentes';
COMMENT ON TABLE bills IS 'Facturas y gastos compartidos';
COMMENT ON TABLE bill_notifications IS 'Notificaciones enviadas sobre facturas';
COMMENT ON TABLE general_cleaning_tasks IS 'Tareas de limpieza general';
COMMENT ON TABLE cleaning_task_states IS 'Estados de las tareas de limpieza';
COMMENT ON TABLE general_cleaning_progress IS 'Progreso de limpieza general por responsable';
COMMENT ON TABLE recurring_tasks IS 'Tareas periódicas y recurrentes';

