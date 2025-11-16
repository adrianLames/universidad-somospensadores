<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM docentes";
        $result = $conn->query($sql);
        $docentes = [];
        while($row = $result->fetch_assoc()) {
            $docentes[] = $row;
        }
        echo json_encode($docentes);
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
