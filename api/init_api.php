<?php
// Archivo de inicialización común para todas las APIs
// Incluir en este orden al inicio de cada archivo API

// 1. Error handler (captura errores PHP y los convierte a JSON)
include_once __DIR__ . '/error_handler.php';

// 2. CORS (permite peticiones desde el frontend)
include_once __DIR__ . '/cors.php';

// 3. Content-Type (establece que la respuesta es JSON)
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}
