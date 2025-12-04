@echo off
REM ========================================
REM ITR Dashboard - Script de Inicio Automático para Windows
REM ========================================

echo 🚀 Iniciando ITR Dashboard...
echo.

REM Verificar si estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ No se encuentra package.json. Ejecuta este script desde la raíz del proyecto.
    pause
    exit /b 1
)

REM Paso 1: Crear archivo .env si no existe
echo ℹ️ Configurando variables de entorno...
if not exist ".env" (
    copy env.example .env >nul
    echo ✅ Archivo .env creado desde env.example
) else (
    echo ⚠️ Archivo .env ya existe, no se sobrescribirá
)

REM Paso 2: Crear .env para frontend
echo ℹ️ Configurando frontend...
if not exist "frontend\.env" (
    echo SKIP_PREFLIGHT_CHECK=true > frontend\.env
    echo GENERATE_SOURCEMAP=false >> frontend\.env
    echo FAST_REFRESH=true >> frontend\.env
    echo REACT_APP_API_URL=http://localhost:5000/api >> frontend\.env
    echo REACT_APP_APP_NAME=ITR Dashboard >> frontend\.env
    echo ✅ Archivo .env del frontend creado
) else (
    echo ⚠️ Archivo .env del frontend ya existe
)

REM Paso 3: Verificar dependencias
echo ℹ️ Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️ Instalando dependencias...
    call npm run install-all
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ✅ Dependencias ya instaladas
)

REM Paso 4: Mostrar información
echo ℹ️ Iniciando servicios...
echo.
echo 🔵 Backend: http://localhost:5000
echo 🟢 Frontend: http://localhost:3000
echo 📚 API Docs: Ver README.md y API_DOCUMENTATION.md
echo.
echo ℹ️ Presiona Ctrl+C para detener todos los servicios
echo.

REM Paso 5: Ejecutar proyecto
call npm run dev

REM Cleanup al salir
echo.
echo ℹ️ Servicios detenidos
pause
