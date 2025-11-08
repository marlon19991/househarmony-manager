# 🏠 Configuración Local con PostgreSQL

Esta guía te ayudará a configurar la aplicación para usar tu base de datos PostgreSQL local `housearmony` creada con pgAdmin.

## 📋 Opciones de Configuración

Tienes dos opciones para usar PostgreSQL local:

### Opción 1: Supabase Local (Recomendada) ✅

Usa Supabase CLI para tener todas las funcionalidades (Realtime, Auth, API REST).

### Opción 2: PostgreSQL Directo

Conecta directamente a tu base de datos PostgreSQL, pero sin Realtime ni Auth.

---

## 🚀 Opción 1: Configuración con Supabase Local

### Prerrequisitos

1. **Instalar Supabase CLI:**
   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Windows (con Scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # Linux
   npm install -g supabase
   ```

2. **Instalar Docker Desktop** (requerido para Supabase local)
   - Descarga desde: https://www.docker.com/products/docker-desktop

3. **PostgreSQL local** ya creado en pgAdmin

### Pasos de Configuración

#### 1. Inicializar Supabase Local

```bash
# Desde la raíz del proyecto
cd /Volumes/SanDiskExtreme/projects/MyProjects/housearmony/househarmony-manager

# Inicializar Supabase (si no está inicializado)
supabase init
```

#### 2. Aplicar el Esquema a tu Base de Datos

```bash
# Conectar a tu base de datos PostgreSQL local
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql

# O desde pgAdmin:
# 1. Abre pgAdmin
# 2. Conecta a tu servidor PostgreSQL
# 3. Selecciona la base de datos 'housearmony'
# 4. Ejecuta el script: supabase/migrations/001_initial_schema.sql
```

#### 3. Iniciar Supabase Local

```bash
# Iniciar todos los servicios de Supabase
supabase start

# Esto iniciará:
# - PostgreSQL en el puerto 54322
# - API REST en http://localhost:54321
# - Realtime en ws://localhost:4000
# - Studio en http://localhost:54323
```

#### 4. Obtener las Credenciales

```bash
# Obtener las credenciales de desarrollo
supabase status

# Guarda estos valores:
# - API URL: http://localhost:54321
# - anon key: (la clave anónima)
# - service_role key: (la clave de servicio)
```

#### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Stripe (suscripciones)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_STARTER_PRICE_ID=price_starter_xxx
STRIPE_CHECKOUT_SUCCESS_URL=http://localhost:5173/pricing/success
STRIPE_CHECKOUT_CANCEL_URL=http://localhost:5173/pricing/cancel
VITE_STRIPE_PRO_PRICE_ID=price_xxx
VITE_STRIPE_STARTER_PRICE_ID=price_starter_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Para producción (comentar en desarrollo local)
# VITE_SUPABASE_URL=https://pyepibmlwqjeeaakzsfl.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-clave-produccion
# STRIPE_SECRET_KEY=sk_live_xxx
# STRIPE_STARTER_PRICE_ID=price_live_starter_xxx
# STRIPE_CHECKOUT_SUCCESS_URL=https://tu-dominio.com/pricing/success
# STRIPE_CHECKOUT_CANCEL_URL=https://tu-dominio.com/pricing
# VITE_STRIPE_PRO_PRICE_ID=price_live_xxx
# VITE_STRIPE_STARTER_PRICE_ID=price_live_starter_xxx
# STRIPE_WEBHOOK_SECRET=whsec_live_xxx
# SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-produccion
```

#### 6. Conectar Supabase Local a tu Base de Datos

Si quieres que Supabase use tu base de datos `housearmony` existente:

1. Edita `supabase/config.toml`:
```toml
[db]
# Conectar a tu base de datos existente
# Necesitarás modificar la configuración de Docker
```

2. O crea un link a tu base de datos:
```bash
# Crear un link a tu proyecto local
supabase link --project-ref housearmony-local
```

### Uso con tu Base de Datos Existente

Si ya tienes datos en tu base de datos `housearmony`:

```bash
# 1. Hacer backup de tu base de datos
pg_dump -U postgres housearmony > backup.sql

# 2. Aplicar el esquema (solo crea tablas que no existen)
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql

# 3. Si necesitas migrar datos, hazlo manualmente desde pgAdmin
```

---

## 🔧 Opción 2: PostgreSQL Directo (Sin Supabase)

Si prefieres usar PostgreSQL directamente sin Supabase:

### 1. Aplicar el Esquema

```bash
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql
```

### 2. Instalar PostgREST (API REST)

```bash
# macOS
brew install postgrest

# O descargar desde: https://github.com/PostgREST/postgrest/releases
```

### 3. Configurar PostgREST

Crea un archivo `postgrest.conf`:

```conf
db-uri = "postgresql://postgres:tu-password@localhost:5432/housearmony"
db-schema = "public"
db-anon-role = "anon"
```

### 4. Modificar el Cliente

Necesitarás crear un cliente personalizado que se conecte directamente a PostgreSQL. Esto es más complejo y perderás las funcionalidades de Realtime.

**⚠️ Nota:** Esta opción requiere más configuración y no es recomendada si ya tienes Supabase configurado.

---

## 🎯 Recomendación: Usar Supabase Local

### Ventajas:
- ✅ Mantiene todas las funcionalidades (Realtime, Auth)
- ✅ API REST automática
- ✅ Fácil de configurar
- ✅ Compatible con el código existente
- ✅ Puede usar tu base de datos existente

### Pasos Rápidos:

```bash
# 1. Instalar Supabase CLI
brew install supabase/tap/supabase

# 2. Iniciar Supabase
supabase start

# 3. Aplicar esquema a tu base de datos
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql

# 4. Obtener credenciales
supabase status

# 5. Crear .env con las credenciales
# 6. Iniciar la aplicación
npm run dev
```

---

## 📝 Verificar la Configuración

### 1. Verificar que Supabase está corriendo:

```bash
supabase status
```

### 2. Verificar conexión a la base de datos:

```bash
psql -U postgres -d housearmony -c "\dt"
```

Deberías ver todas las tablas creadas.

### 3. Probar la aplicación:

```bash
npm run dev
```

Abre http://localhost:8080 y verifica que la aplicación funciona.

---

## 🔍 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL está corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `housearmony` existe

### Error: "Table does not exist"
- Ejecuta el script de migración: `supabase/migrations/001_initial_schema.sql`
- Verifica que estás conectado a la base de datos correcta

### Error: "Realtime not working"
- Verifica que Supabase está corriendo: `supabase status`
- Verifica que Realtime está habilitado en `supabase/config.toml`

### Supabase no inicia
- Verifica que Docker Desktop está corriendo
- Verifica los puertos: 54321, 54322, 54323, 4000
- Intenta: `supabase stop` y luego `supabase start`

---

## 🎓 Recursos Adicionales

- [Documentación de Supabase Local](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 📌 Notas Importantes

1. **Datos de Desarrollo vs Producción:**
   - Los datos en Supabase local son independientes de producción
   - Usa variables de entorno para cambiar entre entornos

2. **Backups:**
   - Haz backups regulares de tu base de datos local
   - `pg_dump -U postgres housearmony > backup.sql`

3. **Migraciones:**
   - Las migraciones están en `supabase/migrations/`
   - Aplícalas en orden: 001, 002, etc.

---

**¿Necesitas ayuda?** Revisa los logs con:
```bash
supabase logs
```
