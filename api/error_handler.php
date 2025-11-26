<?php
// Deshabilitar la visualización de errores PHP en la salida HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Registrar errores en archivo de log en lugar de mostrarlos
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

// Handler personalizado para errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'error' => 'Error fatal del servidor',
            'message' => 'Ocurrió un error crítico al procesar la solicitud'
        ]);
    }
});
