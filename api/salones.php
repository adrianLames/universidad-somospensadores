<?php
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
        $sql = "INSERT INTO salones (codigo, edificio, capacidad, tipo, equipamiento) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $equipamiento = isset($data['equipamiento']) ? $data['equipamiento'] : '';
        $stmt->bind_param("ssiss", 
            $data['codigo'], 
            $data['edificio'], 
            $data['capacidad'], 
            $data['tipo'],
            $equipamiento
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
        $id = $_GET['id'];
        $sql = "UPDATE salones SET codigo=?, edificio=?, capacidad=?, tipo=?, equipamiento=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $equipamiento = isset($data['equipamiento']) ? $data['equipamiento'] : '';
        $stmt->bind_param("ssissi", 
            $data['codigo'], 
            $data['edificio'], 
            $data['capacidad'], 
            $data['tipo'],
            $equipamiento,
            $id
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Salón actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar salón"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
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