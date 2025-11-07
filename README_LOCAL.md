# 🏠 Guía Rápida: Desarrollo Local con PostgreSQL

## Configuración Rápida

### 1. Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop install supabase

# Linux
npm install -g supabase
```

### 2. Iniciar Supabase Local

```bash
# Iniciar todos los servicios
npm run supabase:start

# O manualmente
supabase start
```

### 3. Aplicar el Esquema a tu Base de Datos

Desde pgAdmin:
1. Abre pgAdmin
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `housearmony`
4. Abre Query Tool
5. Ejecuta el contenido de: `supabase/migrations/001_initial_schema.sql`

O desde terminal:
```bash
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql
```

### 4. Configurar Variables de Entorno

```bash
# Obtener credenciales
npm run supabase:status

# Crear archivo .env
cp .env.example .env

# Editar .env con las credenciales:
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=(obtener del comando anterior)
```

### 5. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:8080

---

## Script de Configuración Automática

Para facilitar la configuración, ejecuta:

```bash
npm run setup:local
```

Este script:
- ✅ Verifica que Supabase CLI está instalado
- ✅ Verifica que Docker está corriendo
- ✅ Crea el archivo .env si no existe
- ✅ Inicializa Supabase si es necesario
- ✅ Inicia Supabase local
- ✅ Aplica el esquema a tu base de datos

---

## Comandos Útiles

```bash
# Iniciar Supabase
npm run supabase:start

# Detener Supabase
npm run supabase:stop

# Ver estado y credenciales
npm run supabase:status

# Reiniciar base de datos
npm run supabase:reset

# Ver logs
supabase logs
```

---

## Estructura de la Base de Datos

Tu base de datos `housearmony` tendrá estas tablas:

- `profiles` - Perfiles de usuarios
- `bills` - Facturas y gastos
- `bill_notifications` - Notificaciones de facturas
- `general_cleaning_tasks` - Tareas de limpieza
- `cleaning_task_states` - Estados de tareas
- `general_cleaning_progress` - Progreso de limpieza
- `recurring_tasks` - Tareas periódicas

---

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL está corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `housearmony` existe

### Error: "Table does not exist"
- Ejecuta el script de migración: `supabase/migrations/001_initial_schema.sql`
- Verifica que estás conectado a la base de datos correcta

### Supabase no inicia
- Verifica que Docker Desktop está corriendo
- Verifica los puertos: 54321, 54322, 54323, 4000
- Intenta: `supabase stop` y luego `supabase start`

---

## Más Información

Para información detallada, consulta: [CONFIGURACION_LOCAL.md](./CONFIGURACION_LOCAL.md)

