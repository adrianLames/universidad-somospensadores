<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener todos los administradores con información del usuario
        $sql = "SELECT a.*, u.identificacion, u.nombres, u.apellidos, u.email, u.telefono, 
                   u.fecha_nacimiento, u.direccion, u.fecha_creacion as fecha_creacion_usuario,
                   u.facultad_id, f.nombre as facultad_nombre, u.programa_id, p.nombre as programa_nombre,
                   sup.nombres as supervisor_nombres, sup.apellidos as supervisor_apellidos
            FROM administradores a 
            INNER JOIN usuarios u ON a.usuario_id = u.id 
            LEFT JOIN facultades f ON u.facultad_id = f.id
            LEFT JOIN programas p ON u.programa_id = p.id
            LEFT JOIN administradores sup_admin ON a.supervisor_id = sup_admin.id
            LEFT JOIN usuarios sup ON sup_admin.usuario_id = sup.id
            WHERE u.activo = 1 AND a.estado_admin != 'suspendido'
            ORDER BY u.nombres, u.apellidos";
        $result = $conn->query($sql);
        $administradores = [];
        while($row = $result->fetch_assoc()) {
            $administradores[] = $row;
        }
        echo json_encode($administradores);
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
                         VALUES ('admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
            
            // Crear registro de administrador
            $codigo_empleado = 'ADM-' . str_pad($usuario_id, 6, '0', STR_PAD_LEFT);
            $sql_admin = "INSERT INTO administradores (usuario_id, codigo_empleado, cargo, departamento, nivel_acceso, fecha_nombramiento) 
                         VALUES (?, ?, ?, ?, ?, ?)";
            $stmt_admin = $conn->prepare($sql_admin);
            $cargo = isset($data['cargo']) ? $data['cargo'] : 'Administrador';
            $departamento = isset($data['departamento']) ? $data['departamento'] : 'Administración';
            $nivel_acceso = isset($data['nivel_acceso']) ? $data['nivel_acceso'] : 'admin';
            $fecha_nombramiento = isset($data['fecha_nombramiento']) ? $data['fecha_nombramiento'] : date('Y-m-d');
            $stmt_admin->bind_param("isssss", $usuario_id, $codigo_empleado, $cargo, $departamento, $nivel_acceso, $fecha_nombramiento);
            $stmt_admin->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Administrador creado exitosamente", "codigo" => $codigo_empleado]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al crear administrador: " . $e->getMessage()]);
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
            
            // Actualizar administrador
            $sql_admin = "UPDATE administradores SET cargo=?, departamento=?, nivel_acceso=?, salario=?, supervisor_id=?, observaciones=? WHERE id=?";
            $stmt_admin = $conn->prepare($sql_admin);
            $supervisor_id = isset($data['supervisor_id']) && $data['supervisor_id'] !== '' ? $data['supervisor_id'] : null;
            $stmt_admin->bind_param("sssdisi", 
                $data['cargo'], 
                $data['departamento'], 
                $data['nivel_acceso'],
                $data['salario'],
                $supervisor_id,
                $data['observaciones'],
                $id
            );
            $stmt_admin->execute();
            
            $conn->commit();
            echo json_encode(["message" => "Administrador actualizado exitosamente"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar administrador: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        
        try {
            // Obtener usuario_id antes de eliminar
            $sql_get_user = "SELECT usuario_id FROM administradores WHERE id=?";
            $stmt_get = $conn->prepare($sql_get_user);
            $stmt_get->bind_param("i", $id);
            $stmt_get->execute();
            $result = $stmt_get->get_result();
            $admin = $result->fetch_assoc();
            
            if ($admin) {
                // Desactivar usuario en lugar de eliminar
                $sql_user = "UPDATE usuarios SET activo=0 WHERE id=?";
                $stmt_user = $conn->prepare($sql_user);
                $stmt_user->bind_param("i", $admin['usuario_id']);
                $stmt_user->execute();
                
                // Marcar administrador como suspendido
                $sql_admin = "UPDATE administradores SET estado_admin='suspendido' WHERE id=?";
                $stmt_admin = $conn->prepare($sql_admin);
                $stmt_admin->bind_param("i", $id);
                $stmt_admin->execute();
                
                echo json_encode(["message" => "Administrador eliminado exitosamente"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Administrador no encontrado"]);
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar administrador: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
