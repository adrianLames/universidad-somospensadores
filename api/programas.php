<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM programas WHERE activo = 1";
        $result = $conn->query($sql);
        $programas = [];
        while($row = $result->fetch_assoc()) {
            $programas[] = $row;
        }
        echo json_encode($programas);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO programas (codigo, nombre, descripcion, duracion_semestres, creditos_totales) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['duracion_semestres'], 
            $data['creditos_totales']
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Programa creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear programa: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        $sql = "UPDATE programas SET codigo=?, nombre=?, descripcion=?, duracion_semestres=?, creditos_totales=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssiii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['duracion_semestres'], 
            $data['creditos_totales'],
            $id
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Programa actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar programa"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "UPDATE programas SET activo=0 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Programa eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar programa"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>