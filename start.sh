#!/bin/bash

# ========================================
# ITR Dashboard - Script de Inicio Automático
# ========================================

echo "🚀 Iniciando ITR Dashboard..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encuentra package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Paso 1: Crear archivo .env si no existe
log_info "Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cp env.example .env
    log_success "Archivo .env creado desde env.example"
else
    log_warning "Archivo .env ya existe, no se sobrescribirá"
fi

# Paso 2: Crear .env para frontend
log_info "Configurando frontend..."
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
FAST_REFRESH=true
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=ITR Dashboard
EOF
    log_success "Archivo .env del frontend creado"
else
    log_warning "Archivo .env del frontend ya existe"
fi

# Paso 3: Verificar dependencias
log_info "Verificando dependencias..."

if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    log_warning "Instalando dependencias..."
    npm run install-all
    if [ $? -eq 0 ]; then
        log_success "Dependencias instaladas correctamente"
    else
        log_error "Error instalando dependencias"
        exit 1
    fi
else
    log_success "Dependencias ya instaladas"
fi

# Paso 4: Verificar puertos disponibles
log_info "Verificando puertos..."

# Verificar puerto 5000 (backend)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
    log_warning "Puerto 5000 ya está en uso"
    log_info "Deteniendo procesos en puerto 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

# Verificar puerto 3000 (frontend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    log_warning "Puerto 3000 ya está en uso"
    log_info "Deteniendo procesos en puerto 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

sleep 2

# Paso 5: Iniciar servicios
log_info "Iniciando servicios..."
echo ""
echo "🔵 Backend: http://localhost:5000"
echo "🟢 Frontend: http://localhost:3000"
echo "📚 API Docs: Ver README.md y API_DOCUMENTATION.md"
echo ""
log_info "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Ejecutar con npm run dev
npm run dev

# Cleanup al salir
cleanup() {
    echo ""
    log_info "Deteniendo servicios..."
    
    # Matar procesos en puertos específicos
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Matar procesos por nombre
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    
    log_success "Servicios detenidos"
    exit 0
}

# Registrar función de limpieza
trap cleanup SIGINT SIGTERM

# Esperar indefinidamente (el comando npm run dev maneja la ejecución)
wait
