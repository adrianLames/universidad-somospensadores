<?php
// Archivo central para cabeceras CORS en desarrollo local
// Trazas de depuración: escribir en el log para comprobar si este archivo se ejecuta
error_log("[CORS] request_method=" . ($_SERVER['REQUEST_METHOD'] ?? '') . " origin=" . ($_SERVER['HTTP_ORIGIN'] ?? '(none)'));
// Añadir un header de debug para poder ver si PHP respondió al preflight
header('X-Cors-Handler: php', true);
// Nota: no establecemos Access-Control-Allow-Origin aquí para evitar duplicados
// con la configuración Apache (.htaccess). Apache ahora envía Access-Control-Allow-Origin
// para las respuestas OPTIONS, y PHP añade/asegura otros headers si es necesario.
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With', true);
// Opcional: permitir credenciales si las usas
// header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
