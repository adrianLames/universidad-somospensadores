<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $docente_id = isset($_GET['docente_id']) ? $_GET['docente_id'] : '';
        $programa_id = isset($_GET['programa_id']) ? $_GET['programa_id'] : '';
        $activo_only = isset($_GET['activo']) ? intval($_GET['activo']) : 0;

        if($docente_id) {
            $sql = "SELECT DISTINCT c.*, p.nombre as programa_nombre
                FROM cursos c 
                LEFT JOIN programas p ON c.programa_id = p.id 
                LEFT JOIN asignacion_docentes ad ON c.id = ad.curso_id 
                WHERE ad.docente_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $docente_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else if($programa_id) {
            $sql = "SELECT c.*, p.nombre as programa_nombre
                FROM cursos c 
                LEFT JOIN programas p ON c.programa_id = p.id 
                WHERE c.programa_id = ?";
            if ($activo_only) {
                $sql .= " AND c.activo = 1";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $programa_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT c.*, p.nombre as programa_nombre
                FROM cursos c 
                LEFT JOIN programas p ON c.programa_id = p.id";
            if ($activo_only) {
                $sql .= " WHERE c.activo = 1";
            }
            $sql .= " ORDER BY c.codigo";
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
        
        // Verificar si la columna es_publico existe
        $check_column = $conn->query("SHOW COLUMNS FROM cursos LIKE 'es_publico'");
        $has_es_publico = $check_column->num_rows > 0;
        
        if ($has_es_publico) {
            $sql = "INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id, facultad_id, jornada, activo, es_prerequisito, es_publico, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
            $es_prerequisito = isset($data['es_prerequisito']) && ($data['es_prerequisito'] === true || $data['es_prerequisito'] === 1 || $data['es_prerequisito'] === '1') ? 1 : 0;
            $es_publico = isset($data['es_publico']) && ($data['es_publico'] === true || $data['es_publico'] === 1 || $data['es_publico'] === '1') ? 1 : 0;
            $facultad_id = isset($data['facultad_id']) && $data['facultad_id'] !== '' ? $data['facultad_id'] : null;
            $jornada = isset($data['jornada']) && in_array($data['jornada'], ['diurna','nocturna']) ? $data['jornada'] : 'diurna';
            $stmt->bind_param("sssiiissii", 
                $data['codigo'], 
                $data['nombre'], 
                $data['descripcion'], 
                $data['creditos'], 
                $data['programa_id'],
                $facultad_id,
                $jornada,
                $activo,
                $es_prerequisito,
                $es_publico
            );
        } else {
            $sql = "INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id, facultad_id, jornada, activo, es_prerequisito, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
            $es_prerequisito = isset($data['es_prerequisito']) && ($data['es_prerequisito'] === true || $data['es_prerequisito'] === 1 || $data['es_prerequisito'] === '1') ? 1 : 0;
            $facultad_id = isset($data['facultad_id']) && $data['facultad_id'] !== '' ? $data['facultad_id'] : null;
            $jornada = isset($data['jornada']) && in_array($data['jornada'], ['diurna','nocturna']) ? $data['jornada'] : 'diurna';
            $stmt->bind_param("sssiiissi", 
                $data['codigo'], 
                $data['nombre'], 
                $data['descripcion'], 
                $data['creditos'], 
                $data['programa_id'],
                $facultad_id,
                $jornada,
                $activo,
                $es_prerequisito
            );
        }
        
        if($stmt->execute()) {
            // Si el curso es marcado como prerequisito, guardarlo en la tabla prerequisitos
            if (isset($data['prerequisito']) && ($data['prerequisito'] === true || $data['prerequisito'] === 1 || $data['prerequisito'] === '1')) {
                $curso_id = $conn->insert_id;
                $sql2 = "INSERT INTO prerequisitos (curso_id, codigo, nombre, descripcion, creditos, programa_id, facultad_id, activo, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                $stmt2 = $conn->prepare($sql2);
                $stmt2->bind_param("isssiiis",
                    $curso_id,
                    $data['codigo'],
                    $data['nombre'],
                    $data['descripcion'],
                    $data['creditos'],
                    $data['programa_id'],
                    $facultad_id,
                    $activo
                );
                $stmt2->execute();
            }
            echo json_encode(["message" => "Curso creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear curso: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        
        // Verificar si la columna es_publico existe
        $check_column = $conn->query("SHOW COLUMNS FROM cursos LIKE 'es_publico'");
        $has_es_publico = $check_column->num_rows > 0;
        
        if ($has_es_publico) {
            $sql = "UPDATE cursos SET codigo=?, nombre=?, descripcion=?, creditos=?, programa_id=?, facultad_id=?, jornada=?, activo=?, es_prerequisito=?, es_publico=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
            $es_prerequisito = isset($data['es_prerequisito']) && ($data['es_prerequisito'] === true || $data['es_prerequisito'] === 1 || $data['es_prerequisito'] === '1') ? 1 : 0;
            $es_publico = isset($data['es_publico']) && ($data['es_publico'] === true || $data['es_publico'] === 1 || $data['es_publico'] === '1') ? 1 : 0;
            $facultad_id = isset($data['facultad_id']) && $data['facultad_id'] !== '' ? $data['facultad_id'] : null;
            $jornada = isset($data['jornada']) && in_array($data['jornada'], ['diurna','nocturna']) ? $data['jornada'] : 'diurna';
            $stmt->bind_param("sssiiissiii", 
                $data['codigo'], 
                $data['nombre'], 
                $data['descripcion'], 
                $data['creditos'], 
                $data['programa_id'],
                $facultad_id,
                $jornada,
                $activo,
                $es_prerequisito,
                $es_publico,
                $id
            );
        } else {
            $sql = "UPDATE cursos SET codigo=?, nombre=?, descripcion=?, creditos=?, programa_id=?, facultad_id=?, jornada=?, activo=?, es_prerequisito=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $activo = isset($data['activo']) && ($data['activo'] === true || $data['activo'] === 1 || $data['activo'] === '1') ? 1 : 0;
            $es_prerequisito = isset($data['es_prerequisito']) && ($data['es_prerequisito'] === true || $data['es_prerequisito'] === 1 || $data['es_prerequisito'] === '1') ? 1 : 0;
            $facultad_id = isset($data['facultad_id']) && $data['facultad_id'] !== '' ? $data['facultad_id'] : null;
            $jornada = isset($data['jornada']) && in_array($data['jornada'], ['diurna','nocturna']) ? $data['jornada'] : 'diurna';
            $stmt->bind_param("sssiiissii", 
                $data['codigo'], 
                $data['nombre'], 
                $data['descripcion'], 
                $data['creditos'], 
                $data['programa_id'],
                $facultad_id,
                $jornada,
                $activo,
                $es_prerequisito,
                $id
            );
        }
        $success = false;
        if($stmt->execute()) {
            // Actualizar tabla prerequisitos según el valor de prerequisito
            if (isset($data['prerequisito']) && ($data['prerequisito'] === true || $data['prerequisito'] === 1 || $data['prerequisito'] === '1')) {
                // Verificar si ya existe en prerequisitos
                $check = $conn->prepare("SELECT id FROM prerequisitos WHERE curso_id=?");
                $check->bind_param("i", $id);
                $check->execute();
                $check->store_result();
                if ($check->num_rows > 0) {
                    // Actualizar datos
                    $sql2 = "UPDATE prerequisitos SET codigo=?, nombre=?, descripcion=?, creditos=?, programa_id=?, facultad_id=?, activo=? WHERE curso_id=?";
                    $stmt2 = $conn->prepare($sql2);
                    $stmt2->bind_param("sssiiiii",
                        $data['codigo'],
                        $data['nombre'],
                        $data['descripcion'],
                        $data['creditos'],
                        $data['programa_id'],
                        $facultad_id,
                        $activo,
                        $id
                    );
                    $stmt2->execute();
                } else {
                    // Insertar nuevo
                    $sql2 = "INSERT INTO prerequisitos (curso_id, codigo, nombre, descripcion, creditos, programa_id, facultad_id, activo, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                    $stmt2 = $conn->prepare($sql2);
                    $stmt2->bind_param("isssiiis",
                        $id,
                        $data['codigo'],
                        $data['nombre'],
                        $data['descripcion'],
                        $data['creditos'],
                        $data['programa_id'],
                        $facultad_id,
                        $activo
                    );
                    $stmt2->execute();
                }
            } else {
                // Si no es prerequisito, eliminar si existe
                $del = $conn->prepare("DELETE FROM prerequisitos WHERE curso_id=?");
                $del->bind_param("i", $id);
                $del->execute();
            }
            $success = true;
            echo json_encode(["message" => "Curso actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar curso"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM cursos WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Curso eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar curso"]);
        }
        break;
        
    case 'PATCH':
        // Permitir actualizar el prerequisito de un curso con PATCH
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
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>