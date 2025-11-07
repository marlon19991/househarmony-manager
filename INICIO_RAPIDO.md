# 🚀 Inicio Rápido - HouseHarmony Manager

## ✅ Estado Actual

- ✅ Dependencias instaladas
- ✅ Supabase Local configurado y corriendo
- ✅ Esquema de base de datos aplicado
- ✅ Servidor de desarrollo iniciado

## 📝 Pasos Completados

### 1. Instalación de Dependencias
```bash
npm install
```
✅ Completado - 466 paquetes instalados

### 2. Configuración de Supabase Local
```bash
supabase start
```
✅ Completado - Supabase corriendo en:
- API URL: http://127.0.0.1:54321
- Studio URL: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 4. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:8080**

---

## 🎯 Próximos Pasos

### 1. Verificar que la Aplicación Funciona

1. Abre tu navegador en: http://localhost:8080
2. Deberías ver la página principal de HouseHarmony Manager
3. Navega a "Settings" para crear perfiles

### 2. Usar tu Base de Datos Local `housearmony`

Si quieres usar tu base de datos PostgreSQL `housearmony` creada con pgAdmin:

#### Opción A: Aplicar el esquema a tu base de datos

```bash
# Aplicar el esquema SQL
psql -U postgres -d housearmony -f supabase/migrations/001_initial_schema.sql
```

Luego, en tu archivo `.env`, cambia la URL para apuntar a tu base de datos:
```env
# Nota: Esto requiere configuración adicional de PostgREST
# Es más fácil usar Supabase Local que ya tiene todo configurado
```

#### Opción B: Usar la base de datos de Supabase Local (Recomendado)

Supabase Local ya creó todas las tablas. Puedes:
- Ver las tablas en Supabase Studio: http://127.0.0.1:54323
- Conectarte con pgAdmin a: `127.0.0.1:54322` (usuario: postgres, password: postgres)

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

### Supabase

```bash
# Ver estado
npm run supabase:status

# Iniciar Supabase
npm run supabase:start

# Detener Supabase
npm run supabase:stop

# Reiniciar base de datos
npm run supabase:reset
```

### Configuración

```bash
# Ejecutar script de configuración automática
npm run setup:local
```

---

## 📊 Estructura de la Base de Datos

Las siguientes tablas están disponibles:

- `profiles` - Perfiles de usuarios/residentes
- `bills` - Facturas y gastos compartidos
- `bill_notifications` - Notificaciones de facturas
- `general_cleaning_tasks` - Tareas de limpieza general
- `cleaning_task_states` - Estados de las tareas
- `general_cleaning_progress` - Progreso de limpieza
- `recurring_tasks` - Tareas periódicas

---

## 🐛 Solución de Problemas

### Error: "vite: command not found"
✅ **Resuelto** - Ejecuta `npm install` para instalar dependencias

### Error: "Cannot connect to Supabase"
- Verifica que Supabase está corriendo: `npm run supabase:status`
- Verifica las credenciales en `.env`
- Verifica que Docker Desktop está corriendo

### Error: "Table does not exist"
- Las tablas ya fueron creadas cuando iniciaste Supabase
- Verifica en Supabase Studio: http://127.0.0.1:54323

### El servidor no inicia
- Verifica que el puerto 8080 no esté en uso
- Verifica que las dependencias están instaladas: `npm install`

---

## 📚 Recursos

- [Documentación de Supabase Local](https://supabase.com/docs/guides/cli/local-development)
- [Guía de Configuración Local](./CONFIGURACION_LOCAL.md)
- [Mejoras Aplicadas](./MEJORAS_APLICADAS.md)

---

## ✨ Funcionalidades Disponibles

1. **Gestión de Perfiles** - Crear y gestionar perfiles de residentes
2. **Limpieza General** - Gestionar tareas de limpieza con asignación de responsables
3. **Facturas** - Control de gastos compartidos y pagos
4. **Tareas Periódicas** - Administrar tareas recurrentes
5. **Configuración** - Ajustes y preferencias

---

## 🎉 ¡Listo para Usar!

Tu aplicación está configurada y lista para desarrollo local. 

**Próximo paso:** Abre http://localhost:8080 en tu navegador y comienza a usar HouseHarmony Manager.

