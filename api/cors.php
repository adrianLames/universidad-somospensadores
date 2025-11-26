<?php
// Archivo central para cabeceras CORS en desarrollo local
// NO usar error_log aquí porque interfiere con los headers

// Evitar duplicación de headers CORS
if (!headers_sent()) {
    // Limpiar cualquier header CORS previo y establecer solo uno
    header_remove('Access-Control-Allow-Origin');
    header_remove('Access-Control-Allow-Methods');
    header_remove('Access-Control-Allow-Headers');
    
    // Establecer headers CORS una sola vez
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

// Responder a preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

