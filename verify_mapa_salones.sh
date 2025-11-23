#!/bin/bash
# Script de verificación de la instalación del Mapa de Salones

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🗺️  VERIFICACIÓN DE INSTALACIÓN - MAPA DE SALONES            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        return 0
    else
        echo "❌ FALTA: $1"
        return 1
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
        return 0
    else
        echo "❌ FALTA: $1/"
        return 1
    fi
}

echo "📁 Verificando estructura de archivos..."
echo ""

# Componentes
echo "React Components:"
check_file "src/components/MapaSalones.js"
check_file "src/components/MapaSalones.css"

# Configuración
echo ""
echo "Configuración:"
check_file "src/config/googleMapsConfig.js"
check_file "src/config/api.js"

# Utilidades
echo ""
echo "Utilidades:"
check_file "src/utils/mapaSalonesUtils.js"

# Documentación
echo ""
echo "Documentación:"
check_file "MAPA_SALONES_GUIDE.md"
check_file "SETUP_MAPA_SALONES.md"
check_file "RESUMEN_MAPA_SALONES.md"
check_file "MANTENIMIENTO_EXPANSION_MAPA.md"
check_file ".env.example"

# Base de datos
echo ""
echo "Migraciones SQL:"
check_file "migraciones/20251123_datos_ejemplo_mapa_salones.sql"

# Package.json
echo ""
echo "Dependencias:"
if grep -q "@react-google-maps/api" package.json; then
    echo "✅ @react-google-maps/api en package.json"
else
    echo "❌ @react-google-maps/api NO encontrado en package.json"
fi

# Verificar App.js
echo ""
echo "Integración en App.js:"
if grep -q "MapaSalones" src/App.js; then
    echo "✅ MapaSalones importado en App.js"
else
    echo "❌ MapaSalones NO importado en App.js"
fi

if grep -q "/mapa-salones" src/App.js; then
    echo "✅ Ruta /mapa-salones en App.js"
else
    echo "❌ Ruta /mapa-salones NO en App.js"
fi

# Verificar Dashboard.js
echo ""
echo "Integración en Dashboard.js:"
if grep -q "mapa-salones" src/components/Dashboard.js; then
    echo "✅ Enlace a mapa-salones en Dashboard.js"
else
    echo "❌ Enlace a mapa-salones NO en Dashboard.js"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ VERIFICACIÓN COMPLETADA                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Instrucciones finales
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1️⃣  Obtén tu Google Maps API Key:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2️⃣  Configura el archivo .env:"
echo "   cp .env.example .env"
echo "   # Edita .env y añade tu API Key"
echo ""
echo "3️⃣  Instala dependencias (si no están instaladas):"
echo "   npm install @react-google-maps/api"
echo ""
echo "4️⃣  Inicia la aplicación:"
echo "   npm start"
echo ""
echo "5️⃣  Accede a:"
echo "   http://localhost:3000"
echo "   Inicia sesión como estudiante"
echo "   Haz clic en 'Mapa de Salones'"
echo ""
echo "📚 Lee la documentación:"
echo "   - MAPA_SALONES_GUIDE.md (guía completa)"
echo "   - SETUP_MAPA_SALONES.md (configuración rápida)"
echo "   - RESUMEN_MAPA_SALONES.md (resumen general)"
echo ""
