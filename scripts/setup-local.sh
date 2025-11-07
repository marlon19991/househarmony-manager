#!/bin/bash

# Script de configuración para desarrollo local
# Este script ayuda a configurar Supabase local con tu base de datos PostgreSQL

echo "🏠 Configuración de HouseHarmony Manager para desarrollo local"
echo "================================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI no está instalado${NC}"
    echo "Instala Supabase CLI:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    echo "  Linux: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo "Por favor, inicia Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "Creando archivo .env desde .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
        echo -e "${YELLOW}⚠️  Por favor, edita .env con tus credenciales de Supabase local${NC}"
    else
        echo -e "${RED}❌ .env.example no encontrado${NC}"
        echo "Creando .env básico..."
        cat > .env << EOF
# Variables de entorno para Supabase Local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
EOF
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
        echo -e "${YELLOW}⚠️  Por favor, ejecuta 'supabase status' para obtener las credenciales${NC}"
    fi
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

# Verificar si Supabase está inicializado
if [ ! -f supabase/config.toml ]; then
    echo -e "${YELLOW}⚠️  Supabase no está inicializado${NC}"
    echo "Inicializando Supabase..."
    supabase init
    echo -e "${GREEN}✅ Supabase inicializado${NC}"
else
    echo -e "${GREEN}✅ Supabase ya está inicializado${NC}"
fi

# Preguntar si quiere iniciar Supabase
echo ""
read -p "¿Quieres iniciar Supabase local ahora? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Iniciando Supabase..."
    supabase start
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Supabase iniciado correctamente${NC}"
        echo ""
        echo "Obtén las credenciales con:"
        echo "  supabase status"
        echo ""
        echo "Y actualiza tu archivo .env con:"
        echo "  VITE_SUPABASE_URL=http://localhost:54321"
        echo "  VITE_SUPABASE_ANON_KEY=(obtener con 'supabase status')"
    else
        echo -e "${RED}❌ Error al iniciar Supabase${NC}"
        exit 1
    fi
fi

# Preguntar si quiere aplicar el esquema a la base de datos
echo ""
read -p "¿Quieres aplicar el esquema SQL a tu base de datos 'housearmony'? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aplicando esquema..."
    
    # Intentar con diferentes métodos de conexión
    if command -v psql &> /dev/null; then
        read -p "Usuario de PostgreSQL (default: postgres): " PG_USER
        PG_USER=${PG_USER:-postgres}
        
        read -sp "Contraseña de PostgreSQL: " PG_PASSWORD
        echo ""
        
        export PGPASSWORD=$PG_PASSWORD
        psql -U $PG_USER -d housearmony -f supabase/migrations/001_initial_schema.sql
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Esquema aplicado correctamente${NC}"
        else
            echo -e "${RED}❌ Error al aplicar el esquema${NC}"
            echo "Puedes aplicar el esquema manualmente desde pgAdmin:"
            echo "  Archivo: supabase/migrations/001_initial_schema.sql"
        fi
        unset PGPASSWORD
    else
        echo -e "${YELLOW}⚠️  psql no está disponible${NC}"
        echo "Por favor, aplica el esquema manualmente desde pgAdmin:"
        echo "  Archivo: supabase/migrations/001_initial_schema.sql"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Configuración completada!${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Ejecuta 'supabase status' para obtener las credenciales"
echo "  2. Actualiza .env con las credenciales"
echo "  3. Ejecuta 'npm run dev' para iniciar la aplicación"
echo ""
echo "Para más información, consulta: CONFIGURACION_LOCAL.md"

