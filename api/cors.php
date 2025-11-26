<?php
// Archivo central para cabeceras CORS en desarrollo local
// NO usar error_log aquí porque interfiere con los headers

// Establecer headers CORS ANTES de cualquier otra salida
header('X-Cors-Handler: php', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With', true);

// Responder a preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
