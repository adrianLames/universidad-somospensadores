<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $estudiante_id = isset($_GET['estudiante_id']) ? $_GET['estudiante_id'] : '';
        $docente_id = isset($_GET['docente_id']) ? $_GET['docente_id'] : '';
        
        if($estudiante_id) {
            $sql = "SELECT c.*, cur.codigo as curso_codigo, cur.nombre as curso_nombre, cur.creditos
                    FROM calificaciones c 
                    INNER JOIN cursos cur ON c.curso_id = cur.id 
                    WHERE c.estudiante_id = ? 
                    ORDER BY c.anio DESC, c.semestre DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $estudiante_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else if($docente_id) {
            $sql = "SELECT c.*, cur.codigo as curso_codigo, cur.nombre as curso_nombre,
                           u.nombres as estudiante_nombres, u.apellidos as estudiante_apellidos
                    FROM calificaciones c 
                    INNER JOIN cursos cur ON c.curso_id = cur.id 
                    INNER JOIN usuarios u ON c.estudiante_id = u.id 
                    INNER JOIN asignacion_docentes ad ON cur.id = ad.curso_id 
                    WHERE ad.docente_id = ? 
                    ORDER BY c.anio DESC, c.semestre DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $docente_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT c.*, cur.codigo as curso_codigo, cur.nombre as curso_nombre,
                           u.nombres as estudiante_nombres, u.apellidos as estudiante_apellidos
                    FROM calificaciones c 
                    INNER JOIN cursos cur ON c.curso_id = cur.id 
                    INNER JOIN usuarios u ON c.estudiante_id = u.id 
                    ORDER BY c.anio DESC, c.semestre DESC";
            $result = $conn->query($sql);
        }
        
        $calificaciones = [];
        while($row = $result->fetch_assoc()) {
            $calificaciones[] = $row;
        }
        echo json_encode($calificaciones);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Determinar estado basado en la nota
        $estado = ($data['nota_final'] >= 3.0) ? 'aprobado' : 'reprobado';
        
        // Verificar si ya existe calificación para este estudiante, curso y semestre
        $check_sql = "SELECT id FROM calificaciones WHERE estudiante_id = ? AND curso_id = ? AND semestre = ? AND anio = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("iisi", $data['estudiante_id'], $data['curso_id'], $data['semestre'], $data['anio']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if($check_result->num_rows > 0) {
            // Actualizar calificación existente
            $sql = "UPDATE calificaciones SET nota_final=?, estado=? WHERE estudiante_id=? AND curso_id=? AND semestre=? AND anio=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("dsiisi", 
                $data['nota_final'],
                $estado,
                $data['estudiante_id'],
                $data['curso_id'],
                $data['semestre'],
                $data['anio']
            );
        } else {
            // Insertar nueva calificación
            $sql = "INSERT INTO calificaciones (estudiante_id, curso_id, semestre, anio, nota_final, estado) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iisids", 
                $data['estudiante_id'],
                $data['curso_id'],
                $data['semestre'],
                $data['anio'],
                $data['nota_final'],
                $estado
            );
        }
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Calificación registrada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al registrar calificación: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        
        // Determinar estado basado en la nota
        $estado = ($data['nota_final'] >= 3.0) ? 'aprobado' : 'reprobado';
        
        $sql = "UPDATE calificaciones SET nota_final=?, estado=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("dsi", $data['nota_final'], $estado, $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Calificación actualizada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar calificación"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM calificaciones WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Calificación eliminada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar calificación"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>