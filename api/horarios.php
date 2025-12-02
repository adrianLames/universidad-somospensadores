<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT h.*, c.codigo as curso_codigo, c.nombre as curso_nombre, c.programa_id as curso_programa_id,
                   u.nombres as docente_nombres, u.apellidos as docente_apellidos,
                   s.codigo as salon_codigo, s.edificio as salon_edificio
            FROM horarios h
            LEFT JOIN cursos c ON h.curso_id = c.id
            LEFT JOIN usuarios u ON h.docente_id = u.id
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
            $sql = "INSERT INTO horarios (docente_id, curso_id, salon_id, dia_semana, hora_inicio, hora_fin, color) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiissss", 
                $data['docente_id'],
                $data['curso_id'],
                $data['salon_id'],
                $data['dia_semana'],
                $data['hora_inicio'],
                $data['hora_fin'],
                $data['color']
            );

            if($stmt->execute()) {
                // Actualizar el estado del salón a "Ocupado"
                $update_sql = "UPDATE salones SET estado = 'Ocupado' WHERE id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("i", $data['salon_id']);
                $update_stmt->execute();
                
                echo json_encode(["message" => "Horario asignado exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al asignar horario: " . $stmt->error]);
            }
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        
        // Obtener el salon_id antes de eliminar
        $get_salon_sql = "SELECT salon_id FROM horarios WHERE id = ?";
        $get_stmt = $conn->prepare($get_salon_sql);
        $get_stmt->bind_param("i", $id);
        $get_stmt->execute();
        $result = $get_stmt->get_result();
        $row = $result->fetch_assoc();
        $salon_id = $row['salon_id'];
        
        $sql = "DELETE FROM horarios WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            // Verificar si el salón tiene más horarios asignados
            $check_sql = "SELECT COUNT(*) as count FROM horarios WHERE salon_id = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("i", $salon_id);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            $check_row = $check_result->fetch_assoc();
            
            // Si no hay más horarios, cambiar estado a Disponible
            if($check_row['count'] == 0) {
                $update_sql = "UPDATE salones SET estado = 'Disponible' WHERE id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("i", $salon_id);
                $update_stmt->execute();
            }
            
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