<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener todos los docentes con información del usuario
        $sql = "SELECT d.*, u.identificacion, u.nombres, u.apellidos, u.email, u.telefono, 
                       u.fecha_nacimiento, u.direccion, u.facultad, p.nombre as programa_nombre
                FROM docentes d 
                INNER JOIN usuarios u ON d.usuario_id = u.id 
                LEFT JOIN programas p ON u.programa_id = p.id
                WHERE u.activo = 1 AND d.estado_docente != 'inactivo'
                ORDER BY u.nombres, u.apellidos";
        $result = $conn->query($sql);
        $docentes = [];
        while($row = $result->fetch_assoc()) {
            $docentes[] = $row;
        }
        echo json_encode($docentes);
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
            $sql_user = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad, programa_id, password_hash) 
                         VALUES ('docente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt_user = $conn->prepare($sql_user);
            $stmt_user->bind_param("ssssssssis", 
                $data['identificacion'],
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['direccion'],
                $data['facultad'],
                $data['programa_id'],
                $password_hash
            );
            $stmt_user->execute();
            $usuario_id = $conn->insert_id;
            
            // Crear registro de docente
            $codigo_docente = 'DOC-' . str_pad($usuario_id, 6, '0', STR_PAD_LEFT);
            $sql_docente = "INSERT INTO docentes (usuario_id, codigo_docente, titulo_profesional, experiencia_anos, tipo_contrato, fecha_vinculacion, especialidad) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt_docente = $conn->prepare($sql_docente);
            $titulo = isset($data['titulo_profesional']) ? $data['titulo_profesional'] : '';
            $experiencia = isset($data['experiencia_anos']) ? $data['experiencia_anos'] : 0;
            $contrato = isset($data['tipo_contrato']) ? $data['tipo_contrato'] : 'catedra';
            $fecha_vinculacion = isset($data['fecha_vinculacion']) ? $data['fecha_vinculacion'] : date('Y-m-d');
            $especialidad = isset($data['especialidad']) ? $data['especialidad'] : '';
            $stmt_docente->bind_param("issssss", $usuario_id, $codigo_docente, $titulo, $experiencia, $contrato, $fecha_vinculacion, $especialidad);
            $stmt_docente->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Docente creado exitosamente", "codigo" => $codigo_docente]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al crear docente: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        
        try {
            $conn->begin_transaction();
            
            // Actualizar usuario
            if(isset($data['password']) && !empty($data['password'])) {
                $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
                $sql_user = "UPDATE usuarios SET identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad=?, programa_id=?, password_hash=? WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("ssssssssssi", 
                    $data['identificacion'], $data['nombres'], $data['apellidos'], $data['email'], 
                    $data['telefono'], $data['fecha_nacimiento'], $data['direccion'], 
                    $data['facultad'], $data['programa_id'], $password_hash, $data['usuario_id']
                );
            } else {
                $sql_user = "UPDATE usuarios SET identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad=?, programa_id=? WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("sssssssssi", 
                    $data['identificacion'], $data['nombres'], $data['apellidos'], $data['email'], 
                    $data['telefono'], $data['fecha_nacimiento'], $data['direccion'], 
                    $data['facultad'], $data['programa_id'], $data['usuario_id']
                );
            }
            $stmt_user->execute();
            
            // Actualizar docente
            $sql_docente = "UPDATE docentes SET titulo_profesional=?, titulo_postgrado=?, experiencia_anos=?, tipo_contrato=?, especialidad=?, horas_semanales=?, observaciones=? WHERE id=?";
            $stmt_docente = $conn->prepare($sql_docente);
            $stmt_docente->bind_param("ssissssi", 
                $data['titulo_profesional'], 
                $data['titulo_postgrado'], 
                $data['experiencia_anos'],
                $data['tipo_contrato'],
                $data['especialidad'],
                $data['horas_semanales'],
                $data['observaciones'],
                $id
            );
            $stmt_docente->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Docente actualizado exitosamente"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar docente: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        
        try {
            // Obtener usuario_id antes de eliminar
            $sql_get_user = "SELECT usuario_id FROM docentes WHERE id=?";
            $stmt_get = $conn->prepare($sql_get_user);
            $stmt_get->bind_param("i", $id);
            $stmt_get->execute();
            $result = $stmt_get->get_result();
            $docente = $result->fetch_assoc();
            
            if ($docente) {
                // Desactivar usuario en lugar de eliminar
                $sql_user = "UPDATE usuarios SET activo=0 WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("i", $docente['usuario_id']);
                $stmt_user->execute();
                
                // Marcar docente como inactivo
                $sql_docente = "UPDATE docentes SET estado_docente='inactivo' WHERE id=?";
                $stmt_docente = $conn->prepare($sql_docente);
                $stmt_docente->bind_param("i", $id);
                $stmt_docente->execute();
                
                echo json_encode(["message" => "Docente eliminado exitosamente"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Docente no encontrado"]);
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar docente: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
