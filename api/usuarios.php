<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
        $curso_id = isset($_GET['curso_id']) ? $_GET['curso_id'] : '';
        $all = isset($_GET['all']) && $_GET['all'] == '1';
        $activoParam = isset($_GET['activo']) ? $_GET['activo'] : null;

        // Base select
        if ($curso_id) {
            $sql = "SELECT u.*, f.nombre as facultad_nombre, p.nombre as programa_nombre FROM usuarios u 
                LEFT JOIN facultades f ON u.facultad_id = f.id 
                LEFT JOIN programas p ON u.programa_id = p.id 
                INNER JOIN matriculas m ON u.id = m.estudiante_id 
                WHERE m.curso_id = ? AND m.estado = 'activa' AND u.tipo = 'estudiante'";
            if (!$all && $activoParam === null) {
                $sql .= " AND u.activo = 1";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $curso_id);
            } elseif ($activoParam !== null) {
                $sql .= " AND u.activo = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $curso_id, $activoParam);
            } else {
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $curso_id);
            }
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT u.*, f.nombre as facultad_nombre, p.nombre as programa_nombre FROM usuarios u 
                LEFT JOIN facultades f ON u.facultad_id = f.id 
                LEFT JOIN programas p ON u.programa_id = p.id";

            $clauses = [];
            $types = '';
            $values = [];

            if ($tipo) {
                $clauses[] = "u.tipo = ?";
                $types .= 's';
                $values[] = $tipo;
            }

            if ($activoParam !== null) {
                $clauses[] = "u.activo = ?";
                $types .= 'i';
                $values[] = (int)$activoParam;
            } elseif (!$all) {
                $clauses[] = "u.activo = 1";
            }

            if (count($clauses) > 0) {
                $sql .= ' WHERE ' . implode(' AND ', $clauses);
            }

            if ($types !== '') {
                $stmt = $conn->prepare($sql);
                $bindNames = [];
                $bindNames[] = &$types;
                for ($i = 0; $i < count($values); $i++) {
                    $bindNames[] = &$values[$i];
                }
                call_user_func_array([$stmt, 'bind_param'], $bindNames);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $result = $conn->query($sql);
            }
        }
        
        $usuarios = [];
        while($row = $result->fetch_assoc()) {
            unset($row['password_hash']); // No enviar el password
            $usuarios[] = $row;
        }
        echo json_encode($usuarios);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Incluir jornada si está presente y es válida
        if (isset($data['jornada']) && in_array($data['jornada'], ['diurna', 'nocturna'])) {
            $sql = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad_id, programa_id, password_hash, jornada) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssssssssss", 
                $data['tipo'],
                $data['identificacion'],
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['direccion'],
                $data['facultad_id'],
                $data['programa_id'],
                $password_hash,
                $data['jornada']
            );
        } else {
            $sql = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad_id, programa_id, password_hash) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssssssis", 
                $data['tipo'],
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
        }

        if($stmt->execute()) {
            $usuario_id = $conn->insert_id;
            // Si el usuario es docente, crear registro en docentes
            if ($data['tipo'] === 'docente') {
                $facultad_id = !empty($data['facultad_id']) ? $data['facultad_id'] : 'NULL';
                $programa_id = !empty($data['programa_id']) ? $data['programa_id'] : 'NULL';
                $sql_docente = "INSERT INTO docentes (usuario_id, facultad_id, programa_id) VALUES (?, ?, ?)";
                $stmt_doc = $conn->prepare($sql_docente);
                $stmt_doc->bind_param("iii", $usuario_id, $facultad_id, $programa_id);
                $stmt_doc->execute();
            }
            // Si el usuario es estudiante, crear registro en estudiantes
            if ($data['tipo'] === 'estudiante') {
                $facultad_id = !empty($data['facultad_id']) ? $data['facultad_id'] : 'NULL';
                $programa_id = !empty($data['programa_id']) ? $data['programa_id'] : 'NULL';
                $sql_est = "INSERT INTO estudiantes (usuario_id, facultad_id, programa_id) VALUES (?, ?, ?)";
                $stmt_est = $conn->prepare($sql_est);
                $stmt_est->bind_param("iii", $usuario_id, $facultad_id, $programa_id);
                $stmt_est->execute();
            }
            echo json_encode(["message" => "Usuario creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear usuario: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        // evitar que se editen cuentas admin desde la API
        $checkSql = "SELECT tipo FROM usuarios WHERE id = ? LIMIT 1";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkRes = $checkStmt->get_result();
        if($row = $checkRes->fetch_assoc()) {
            if(isset($row['tipo']) && $row['tipo'] === 'admin') {
                http_response_code(403);
                echo json_encode(["error" => "Edición de cuentas administrador no permitida"]);
                exit;
            }
        }
        
        // Normalizar algunos valores esperados
        $activo = isset($data['activo']) ? (int)$data['activo'] : 0;
        $facultad_id = isset($data['facultad_id']) && $data['facultad_id'] !== '' ? (int)$data['facultad_id'] : null;
        $programa_id = isset($data['programa_id']) && $data['programa_id'] !== '' ? (int)$data['programa_id'] : null;
        $jornada = isset($data['jornada']) && in_array($data['jornada'], ['diurna', 'nocturna']) ? $data['jornada'] : null;

        if(isset($data['password']) && !empty($data['password'])) {
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            if (isset($data['jornada']) && in_array($data['jornada'], ['diurna', 'nocturna'])) {
                $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=?, password_hash=?, activo=?, jornada=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssssssssisssi",
                    $data['tipo'],
                    $data['identificacion'],
                    $data['nombres'],
                    $data['apellidos'],
                    $data['email'],
                    $data['telefono'],
                    $data['fecha_nacimiento'],
                    $data['direccion'],
                    $facultad_id,
                    $programa_id,
                    $password_hash,
                    $activo,
                    $data['jornada'],
                    $id
                );
            } else {
                $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=?, password_hash=?, activo=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssssssissii",
                    $data['tipo'],
                    $data['identificacion'],
                    $data['nombres'],
                    $data['apellidos'],
                    $data['email'],
                    $data['telefono'],
                    $data['fecha_nacimiento'],
                    $data['direccion'],
                    $facultad_id,
                    $programa_id,
                    $password_hash,
                    $activo,
                    $id
                );
            }
        } else {
            if (isset($data['jornada']) && in_array($data['jornada'], ['diurna', 'nocturna'])) {
                $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=?, activo=?, jornada=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssssssisssi",
                    $data['tipo'],
                    $data['identificacion'],
                    $data['nombres'],
                    $data['apellidos'],
                    $data['email'],
                    $data['telefono'],
                    $data['fecha_nacimiento'],
                    $data['direccion'],
                    $facultad_id,
                    $programa_id,
                    $activo,
                    $data['jornada'],
                    $id
                );
            } else {
                $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, facultad_id=?, programa_id=?, activo=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssssssisii",
                    $data['tipo'],
                    $data['identificacion'],
                    $data['nombres'],
                    $data['apellidos'],
                    $data['email'],
                    $data['telefono'],
                    $data['fecha_nacimiento'],
                    $data['direccion'],
                    $facultad_id,
                    $programa_id,
                    $activo,
                    $id
                );
            }
        }
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Usuario actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar usuario"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "UPDATE usuarios SET activo=0 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Usuario eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar usuario"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>