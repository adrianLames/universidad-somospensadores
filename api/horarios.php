<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT h.*, c.codigo as curso_codigo, c.nombre as curso_nombre,
                       u.nombres as docente_nombres, u.apellidos as docente_apellidos,
                       s.codigo as salon_codigo, s.edificio as salon_edificio
                FROM horarios h
                LEFT JOIN asignacion_docentes ad ON h.asignacion_docente_id = ad.id
                LEFT JOIN cursos c ON ad.curso_id = c.id
                LEFT JOIN usuarios u ON ad.docente_id = u.id
                LEFT JOIN salones s ON h.salon_id = s.id
                ORDER BY h.dia_semana, h.hora_inicio";
        $result = $conn->query($sql);
        
        $horarios = [];
        while($row = $result->fetch_assoc()) {
            $horarios[] = $row;
        }
        echo json_encode($horarios);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Primero, crear o obtener la asignación del docente
        $asignacion_sql = "SELECT id FROM asignacion_docentes WHERE docente_id = ? AND curso_id = ? AND semestre = ? AND anio = ?";
        $asignacion_stmt = $conn->prepare($asignacion_sql);
        $semestre_actual = date('Y') . '-' . (date('n') <= 6 ? '1' : '2');
        $anio_actual = date('Y');
        $asignacion_stmt->bind_param("iisi", $data['docente_id'], $data['curso_id'], $semestre_actual, $anio_actual);
        $asignacion_stmt->execute();
        $asignacion_result = $asignacion_stmt->get_result();
        
        if($asignacion_result->num_rows > 0) {
            $asignacion = $asignacion_result->fetch_assoc();
            $asignacion_id = $asignacion['id'];
        } else {
            // Crear nueva asignación
            $insert_asignacion_sql = "INSERT INTO asignacion_docentes (docente_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
            $insert_asignacion_stmt = $conn->prepare($insert_asignacion_sql);
            $insert_asignacion_stmt->bind_param("iisi", $data['docente_id'], $data['curso_id'], $semestre_actual, $anio_actual);
            if($insert_asignacion_stmt->execute()) {
                $asignacion_id = $insert_asignacion_stmt->insert_id;
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al crear asignación del docente"]);
                exit();
            }
        }
        
        // Verificar si ya existe un horario en el mismo salón y horario
        $check_sql = "SELECT id FROM horarios WHERE salon_id = ? AND dia_semana = ? AND hora_inicio = ? AND hora_fin = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("isss", $data['salon_id'], $data['dia_semana'], $data['hora_inicio'], $data['hora_fin']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if($check_result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["error" => "El salón ya está ocupado en ese horario"]);
        } else {
            $sql = "INSERT INTO horarios (asignacion_docente_id, salon_id, dia_semana, hora_inicio, hora_fin) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iisss", 
                $asignacion_id,
                $data['salon_id'],
                $data['dia_semana'],
                $data['hora_inicio'],
                $data['hora_fin']
            );
            
            if($stmt->execute()) {
                echo json_encode(["message" => "Horario asignado exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al asignar horario: " . $stmt->error]);
            }
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM horarios WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Horario eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar horario"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>