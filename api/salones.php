<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
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
        $sql = "INSERT INTO salones (codigo, edificio, ubicacion, capacidad, tipo, recursos, equipamiento, estado, latitud, longitud, visible, activo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssssddi", 
            $data['codigo'], 
            $data['edificio'],
            isset($data['ubicacion']) ? $data['ubicacion'] : '',
            $data['capacidad'], 
            $data['tipo'],
            isset($data['recursos']) ? $data['recursos'] : '',
            isset($data['equipamiento']) ? $data['equipamiento'] : '',
            isset($data['estado']) ? $data['estado'] : 'Disponible',
            isset($data['latitud']) ? $data['latitud'] : 3.022922,
            isset($data['longitud']) ? $data['longitud'] : -76.482656,
            isset($data['visible']) ? $data['visible'] : 1
        );
        if($stmt->execute()) {
            echo json_encode(["message" => "Salón creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear salón: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        
        // Construir SQL dinámicamente según qué campos vienen en el request
        $updates = [];
        $types = '';
        $values = [];
        
        if(isset($data['codigo'])) { $updates[] = "codigo=?"; $types .= "s"; $values[] = $data['codigo']; }
        if(isset($data['edificio'])) { $updates[] = "edificio=?"; $types .= "s"; $values[] = $data['edificio']; }
        if(isset($data['ubicacion'])) { $updates[] = "ubicacion=?"; $types .= "s"; $values[] = $data['ubicacion']; }
        if(isset($data['capacidad'])) { $updates[] = "capacidad=?"; $types .= "s"; $values[] = $data['capacidad']; }
        if(isset($data['tipo'])) { $updates[] = "tipo=?"; $types .= "s"; $values[] = $data['tipo']; }
        if(isset($data['recursos'])) { $updates[] = "recursos=?"; $types .= "s"; $values[] = $data['recursos']; }
        if(isset($data['equipamiento'])) { $updates[] = "equipamiento=?"; $types .= "s"; $values[] = $data['equipamiento']; }
        if(isset($data['estado'])) { $updates[] = "estado=?"; $types .= "s"; $values[] = $data['estado']; }
        if(isset($data['latitud'])) { $updates[] = "latitud=?"; $types .= "d"; $values[] = $data['latitud']; }
        if(isset($data['longitud'])) { $updates[] = "longitud=?"; $types .= "d"; $values[] = $data['longitud']; }
        if(isset($data['visible'])) { $updates[] = "visible=?"; $types .= "i"; $values[] = $data['visible'] ? 1 : 0; }
        
        if(empty($updates)) {
            echo json_encode(["error" => "No hay campos para actualizar"]);
            break;
        }
        
        $values[] = $id;
        $types .= "i";
        
        $sql = "UPDATE salones SET " . implode(", ", $updates) . " WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Salón actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar salón: " . $stmt->error]);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        $sql = "UPDATE salones SET activo=0 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Salón eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar salón"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
