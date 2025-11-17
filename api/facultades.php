<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener todas las facultades únicas de la tabla programas
        $sql = "SELECT DISTINCT facultad FROM programas WHERE facultad IS NOT NULL AND facultad != '' AND activo = 1 ORDER BY facultad";
        $result = $conn->query($sql);
        $facultades = [];
        while($row = $result->fetch_assoc()) {
            $facultades[] = $row['facultad'];
        }
        echo json_encode($facultades);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
