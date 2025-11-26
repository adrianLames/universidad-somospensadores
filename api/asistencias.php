<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $estudiante_id = isset($_GET['estudiante_id']) ? $_GET['estudiante_id'] : '';
        $docente_id = isset($_GET['docente_id']) ? $_GET['docente_id'] : '';
        $curso_id = isset($_GET['curso_id']) ? $_GET['curso_id'] : '';
        
        if($estudiante_id) {
            $sql = "SELECT a.*, c.codigo as curso_codigo, c.nombre as curso_nombre 
                    FROM asistencias a 
                    INNER JOIN cursos c ON a.curso_id = c.id 
                    WHERE a.estudiante_id = ? 
                    ORDER BY a.fecha DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $estudiante_id);
            $stmt->execute();
            $result = $stmt->get_result();
                } else if($docente_id) {
                        // Obtener semestre y año actuales
                        $fecha_actual = date('Y-m-d');
                        $anio_actual = date('Y');
                        $mes_actual = date('n');
                        $semestre_actual = ($mes_actual >= 1 && $mes_actual <= 6) ? '2025-1' : '2025-2';
                        // Consulta filtrando por semestre y año de la asignación docente y matrícula activa
                        $sql = "SELECT a.*, c.codigo as curso_codigo, c.nombre as curso_nombre,
                                                     u.nombres as estudiante_nombres, u.apellidos as estudiante_apellidos,
                                                     ad.semestre, ad.anio
                                        FROM asistencias a 
                                        INNER JOIN cursos c ON a.curso_id = c.id 
                                        INNER JOIN usuarios u ON a.estudiante_id = u.id 
                                        INNER JOIN asignacion_docentes ad ON c.id = ad.curso_id 
                                        INNER JOIN matriculas m ON m.estudiante_id = a.estudiante_id AND m.curso_id = a.curso_id
                                        WHERE ad.usuario_id = ?
                                            AND ad.semestre = ?
                                            AND ad.anio = ?
                                            AND m.semestre = ad.semestre
                                            AND m.anio = ad.anio
                                            AND m.estado = 'activa'
                                            AND a.curso_id = ad.curso_id
                                        ORDER BY a.fecha DESC";
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("isi", $docente_id, $semestre_actual, $anio_actual);
                        $stmt->execute();
                        $result = $stmt->get_result();
        } else if($curso_id) {
            $sql = "SELECT a.*, u.nombres as estudiante_nombres, u.apellidos as estudiante_apellidos
                    FROM asistencias a 
                    INNER JOIN usuarios u ON a.estudiante_id = u.id 
                    WHERE a.curso_id = ? 
                    ORDER BY a.fecha DESC, u.apellidos, u.nombres";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $curso_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT a.*, c.codigo as curso_codigo, c.nombre as curso_nombre,
                           u.nombres as estudiante_nombres, u.apellidos as estudiante_apellidos
                    FROM asistencias a 
                    INNER JOIN cursos c ON a.curso_id = c.id 
                    INNER JOIN usuarios u ON a.estudiante_id = u.id 
                    ORDER BY a.fecha DESC";
            $result = $conn->query($sql);
        }
        
        $asistencias = [];
        while($row = $result->fetch_assoc()) {
            $asistencias[] = $row;
        }
        echo json_encode($asistencias);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Verificar si ya existe registro para esa fecha
        $check_sql = "SELECT id FROM asistencias WHERE estudiante_id = ? AND curso_id = ? AND fecha = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("iis", $data['estudiante_id'], $data['curso_id'], $data['fecha']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if($check_result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Ya existe un registro de asistencia para este estudiante en la fecha seleccionada"]);
        } else {
            $sql = "INSERT INTO asistencias (estudiante_id, curso_id, fecha, estado, observaciones) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $observaciones = isset($data['observaciones']) ? $data['observaciones'] : '';
            $stmt->bind_param("iisss", 
                $data['estudiante_id'],
                $data['curso_id'],
                $data['fecha'],
                $data['estado'],
                $observaciones
            );
            
            if($stmt->execute()) {
                echo json_encode(["message" => "Asistencia registrada exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al registrar asistencia: " . $stmt->error]);
            }
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        $sql = "UPDATE asistencias SET estado=?, observaciones=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $observaciones = isset($data['observaciones']) ? $data['observaciones'] : '';
        $stmt->bind_param("ssi", $data['estado'], $observaciones, $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Asistencia actualizada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar asistencia"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM asistencias WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Asistencia eliminada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar asistencia"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>