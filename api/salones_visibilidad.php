<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener salones con su estado de visibilidad
        $sql = "SELECT * FROM salones WHERE activo = 1 ORDER BY edificio, codigo";
        $result = $conn->query($sql);
        $salones = [];
        while($row = $result->fetch_assoc()) {
            $salones[] = $row;
        }
        echo json_encode($salones);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Actualizar directamente la columna visible en la tabla salones
        $sql = "UPDATE salones SET visible = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => "Error en la preparación: " . $conn->error]);
            break;
        }
        
        $visible = $data['visible'] ? 1 : 0;
        $salon_id = $data['salon_id'];
        $stmt->bind_param("ii", $visible, $salon_id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Visibilidad actualizada", "visible" => $visible]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar visibilidad: " . $stmt->error]);
        }
        $stmt->close();
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
