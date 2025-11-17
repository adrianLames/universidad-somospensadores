<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $docente_id = isset($_GET['docente_id']) ? $_GET['docente_id'] : '';
        
        if($docente_id) {
            $sql = "SELECT DISTINCT c.*, p.nombre as programa_nombre 
                    FROM cursos c 
                    LEFT JOIN programas p ON c.programa_id = p.id 
                    LEFT JOIN asignacion_docentes ad ON c.id = ad.curso_id 
                    WHERE c.activo = 1 AND ad.docente_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $docente_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT c.*, p.nombre as programa_nombre 
                    FROM cursos c 
                    LEFT JOIN programas p ON c.programa_id = p.id 
                    WHERE c.activo = 1";
            $result = $conn->query($sql);
        }
        
        $cursos = [];
        while($row = $result->fetch_assoc()) {
            $cursos[] = $row;
        }
        echo json_encode($cursos);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['creditos'], 
            $data['programa_id']
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Curso creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear curso: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        $sql = "UPDATE cursos SET codigo=?, nombre=?, descripcion=?, creditos=?, programa_id=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssiii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['creditos'], 
            $data['programa_id'],
            $id
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Curso actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar curso"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "UPDATE cursos SET activo=0 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Curso eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar curso"]);
        }
        break;
        
        // Permitir actualizar el prerequisito de un curso con PATCH
        if ($method === 'PATCH') {
            $data = json_decode(file_get_contents("php://input"), true);
            $curso_id = isset($data['curso_id']) ? intval($data['curso_id']) : null;
            $prerequisito_id = isset($data['prerequisito_id']) ? intval($data['prerequisito_id']) : null;
            if ($curso_id && $prerequisito_id) {
                $sql = "UPDATE cursos SET prerequisito_id=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $prerequisito_id, $curso_id);
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Prerequisito actualizado exitosamente"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al actualizar prerequisito: " . $stmt->error]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Faltan datos curso_id o prerequisito_id"]);
            }
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido"]);
        }
}

$conn->close();
?>