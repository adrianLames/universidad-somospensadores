<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener todos los estudiantes con información del usuario
        $sql = "SELECT e.*, u.identificacion, u.nombres, u.apellidos, u.email, u.telefono, 
                   u.fecha_nacimiento, u.direccion, u.facultad_id, f.nombre as facultad_nombre, p.nombre as programa_nombre
            FROM estudiantes e 
            INNER JOIN usuarios u ON e.usuario_id = u.id 
            LEFT JOIN facultades f ON u.facultad_id = f.id
            LEFT JOIN programas p ON u.programa_id = p.id
            WHERE u.activo = 1 AND e.estado_estudiante != 'retirado'
            ORDER BY u.nombres, u.apellidos";
        $result = $conn->query($sql);
        $estudiantes = [];
        while($row = $result->fetch_assoc()) {
            $estudiantes[] = $row;
        }
        echo json_encode($estudiantes);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $conn->begin_transaction();
            
            // Verificar si el email ya existe
            $sql_check_email = "SELECT id FROM usuarios WHERE email = ? AND activo = 1";
            $stmt_check = $conn->prepare($sql_check_email);
            $stmt_check->bind_param("s", $data['email']);
            $stmt_check->execute();
            $result_check = $stmt_check->get_result();
            
            if ($result_check->num_rows > 0) {
                http_response_code(400);
                echo json_encode(["error" => "El email ya está registrado en el sistema"]);
                return;
            }
            
            // Verificar si la identificación ya existe
            $sql_check_id = "SELECT id FROM usuarios WHERE identificacion = ? AND activo = 1";
            $stmt_check_id = $conn->prepare($sql_check_id);
            $stmt_check_id->bind_param("s", $data['identificacion']);
            $stmt_check_id->execute();
            $result_check_id = $stmt_check_id->get_result();
            
            if ($result_check_id->num_rows > 0) {
                http_response_code(400);
                echo json_encode(["error" => "La identificación ya está registrada en el sistema"]);
                return;
            }
            
            // Crear usuario primero
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $sql_user = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad_id, programa_id, password_hash) 
                         VALUES ('estudiante', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt_user = $conn->prepare($sql_user);
            $stmt_user->bind_param("sssssssiis", 
                $data['identificacion'],
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['direccion'],
                $data['facultad_id'],
                $data['programa_id'],
                $password_hash
            );
            $stmt_user->execute();
            $usuario_id = $conn->insert_id;
            
            // Crear registro de estudiante
            $codigo_estudiante = 'EST-' . str_pad($usuario_id, 6, '0', STR_PAD_LEFT);
            $sql_estudiante = "INSERT INTO estudiantes (usuario_id, codigo_estudiante, semestre_actual, fecha_ingreso) 
                               VALUES (?, ?, ?, ?)";
            $stmt_estudiante = $conn->prepare($sql_estudiante);
            $semestre = isset($data['semestre_actual']) ? $data['semestre_actual'] : 1;
            $fecha_ingreso = isset($data['fecha_ingreso']) ? $data['fecha_ingreso'] : date('Y-m-d');
            $stmt_estudiante->bind_param("isis", $usuario_id, $codigo_estudiante, $semestre, $fecha_ingreso);
            $stmt_estudiante->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Estudiante creado exitosamente", "codigo" => $codigo_estudiante]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al crear estudiante: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        
        try {
            $conn->begin_transaction();
            
            // Verificar si el email ya existe (excluyendo el usuario actual)
            $sql_check_email = "SELECT id FROM usuarios WHERE email = ? AND activo = 1 AND id != ?";
            $stmt_check = $conn->prepare($sql_check_email);
            $stmt_check->bind_param("si", $data['email'], $data['usuario_id']);
            $stmt_check->execute();
            $result_check = $stmt_check->get_result();
            
            if ($result_check->num_rows > 0) {
                http_response_code(400);
                echo json_encode(["error" => "El email ya está registrado por otro usuario"]);
                return;
            }
            
            // Verificar si la identificación ya existe (excluyendo el usuario actual)
            $sql_check_id = "SELECT id FROM usuarios WHERE identificacion = ? AND activo = 1 AND id != ?";
            $stmt_check_id = $conn->prepare($sql_check_id);
            $stmt_check_id->bind_param("si", $data['identificacion'], $data['usuario_id']);
            $stmt_check_id->execute();
            $result_check_id = $stmt_check_id->get_result();
            
            if ($result_check_id->num_rows > 0) {
                http_response_code(400);
                echo json_encode(["error" => "La identificación ya está registrada por otro usuario"]);
                return;
            }
            
            // Actualizar usuario
            if(isset($data['password']) && !empty($data['password'])) {
                $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
                $sql_user = "UPDATE usuarios SET identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=?, password_hash=? WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("sssssssiisi", 
                    $data['identificacion'], $data['nombres'], $data['apellidos'], $data['email'], 
                    $data['telefono'], $data['fecha_nacimiento'], $data['direccion'], 
                    $data['facultad_id'], $data['programa_id'], $password_hash, $data['usuario_id']
                );
            } else {
                $sql_user = "UPDATE usuarios SET identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=? WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("sssssssiis", 
                    $data['identificacion'], $data['nombres'], $data['apellidos'], $data['email'], 
                    $data['telefono'], $data['fecha_nacimiento'], $data['direccion'], 
                    $data['facultad_id'], $data['programa_id'], $data['usuario_id']
                );
            }
            $stmt_user->execute();
            
            // Actualizar estudiante
            $sql_estudiante = "UPDATE estudiantes SET semestre_actual=?, creditos_cursados=?, promedio_acumulado=?, estado_estudiante=?, observaciones=? WHERE id=?";
            $stmt_estudiante = $conn->prepare($sql_estudiante);
            $semestre_actual = isset($data['semestre_actual']) ? $data['semestre_actual'] : 1;
            $creditos_cursados = isset($data['creditos_cursados']) ? $data['creditos_cursados'] : 0;
            $promedio_acumulado = isset($data['promedio_acumulado']) ? $data['promedio_acumulado'] : 0.00;
            $estado_estudiante = isset($data['estado_estudiante']) ? $data['estado_estudiante'] : 'activo';
            $observaciones = isset($data['observaciones']) ? $data['observaciones'] : '';
            $stmt_estudiante->bind_param("iidssi", 
                $semestre_actual, 
                $creditos_cursados, 
                $promedio_acumulado,
                $estado_estudiante,
                $observaciones,
                $id
            );
            $stmt_estudiante->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Estudiante actualizado exitosamente"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar estudiante: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        
        try {
            // Obtener usuario_id antes de eliminar
            $sql_get_user = "SELECT usuario_id FROM estudiantes WHERE id=?";
            $stmt_get = $conn->prepare($sql_get_user);
            $stmt_get->bind_param("i", $id);
            $stmt_get->execute();
            $result = $stmt_get->get_result();
            $estudiante = $result->fetch_assoc();
            
            if ($estudiante) {
                // Desactivar usuario en lugar de eliminar
                $sql_user = "UPDATE usuarios SET activo=0 WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("i", $estudiante['usuario_id']);
                $stmt_user->execute();
                
                // Marcar estudiante como retirado
                $sql_estudiante = "UPDATE estudiantes SET estado_estudiante='retirado' WHERE id=?";
                $stmt_estudiante = $conn->prepare($sql_estudiante);
                $stmt_estudiante->bind_param("i", $id);
                $stmt_estudiante->execute();
                
                echo json_encode(["message" => "Estudiante eliminado exitosamente"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Estudiante no encontrado"]);
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar estudiante: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
