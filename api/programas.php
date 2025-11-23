<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
<<<<<<< HEAD
        $facultad_id = isset($_GET['facultad_id']) ? intval($_GET['facultad_id']) : 0;
        $all = isset($_GET['all']) ? intval($_GET['all']) : 0;
        if ($all === 1) {
            // Mostrar todos los programas, sin filtrar por activo
            if ($facultad_id) {
                $sql = "SELECT p.*, f.nombre as facultad_nombre FROM programas p LEFT JOIN facultades f ON p.facultad_id = f.id WHERE p.facultad_id = ? ORDER BY p.nombre";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $facultad_id);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $sql = "SELECT p.*, f.nombre as facultad_nombre FROM programas p LEFT JOIN facultades f ON p.facultad_id = f.id ORDER BY p.nombre";
                $result = $conn->query($sql);
            }
        } else {
            // Solo programas activos
            if($facultad_id) {
                $sql = "SELECT p.*, f.nombre as facultad_nombre FROM programas p LEFT JOIN facultades f ON p.facultad_id = f.id WHERE p.facultad_id = ? AND p.activo = 1 ORDER BY p.nombre";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $facultad_id);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $sql = "SELECT p.*, f.nombre as facultad_nombre FROM programas p LEFT JOIN facultades f ON p.facultad_id = f.id WHERE p.activo = 1 ORDER BY p.nombre";
                $result = $conn->query($sql);
            }
        }
=======
        $facultad = isset($_GET['facultad']) ? $_GET['facultad'] : '';
        
        if($facultad) {
            $sql = "SELECT * FROM programas WHERE facultad = ? AND activo = 1 ORDER BY nombre";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $facultad);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT * FROM programas WHERE activo = 1 ORDER BY nombre";
            $result = $conn->query($sql);
        }
        
>>>>>>> 0463b860943076551cf7381e33b9111f296f599d
        $programas = [];
        while($row = $result->fetch_assoc()) {
            $programas[] = $row;
        }
        echo json_encode($programas);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO programas (codigo, nombre, descripcion, facultad_id, duracion_semestres, creditos_totales, activo, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
        $stmt->bind_param("sssiiii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['facultad_id'],
            $data['duracion_semestres'], 
            $data['creditos_totales'],
            $activo
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
        $sql = "UPDATE programas SET codigo=?, nombre=?, descripcion=?, facultad_id=?, duracion_semestres=?, creditos_totales=?, activo=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
        $stmt->bind_param("sssiiiii", 
            $data['codigo'], 
            $data['nombre'], 
            $data['descripcion'], 
            $data['facultad_id'],
            $data['duracion_semestres'], 
            $data['creditos_totales'],
            $activo,
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