<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;
        $docente_id = isset($_GET['docente_id']) ? intval($_GET['docente_id']) : null;

        if ($curso_id) {
            // Obtener el profesor asignado a un curso específico
            $query = "SELECT u.id, u.nombres, u.apellidos, u.email FROM asignacion_docentes ad
                      INNER JOIN usuarios u ON ad.usuario_id = u.id
                      WHERE ad.curso_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param('i', $curso_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $profesores = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode(['success' => true, 'data' => $profesores]);
        } else if ($docente_id) {
            // Obtener las materias asignadas a un docente
            $query = "SELECT ad.id, c.id as curso_id, c.nombre as curso_nombre, ad.semestre, ad.anio
                      FROM asignacion_docentes ad
                      INNER JOIN cursos c ON ad.curso_id = c.id
                      WHERE ad.usuario_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param('i', $docente_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $asignaciones = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode(['success' => true, 'data' => $asignaciones]);
        } else {
            // Obtener todas las vinculaciones docente-materia con datos completos y nombres normalizados
            $query = "SELECT ad.id, ad.usuario_id, ad.curso_id, ad.anio, ad.semestre, 
                             u.nombres, u.apellidos, c.nombre AS materia, c.codigo AS codigo_materia, 
                             p.nombre AS programa_nombre, f.nombre AS facultad_nombre
                      FROM asignacion_docentes ad
                      JOIN docentes d ON ad.usuario_id = d.usuario_id
                      JOIN usuarios u ON d.usuario_id = u.id
                      JOIN cursos c ON ad.curso_id = c.id
                      LEFT JOIN programas p ON c.programa_id = p.id
                      LEFT JOIN facultades f ON p.facultad_id = f.id
                      ORDER BY u.nombres, u.apellidos, c.nombre";
            $result = $conn->query($query);
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $rows]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $usuario_id = $data['docente_id'];  // Aceptar docente_id pero usar usuario_id en BD
        $curso_id = $data['curso_id'];
        $semestre = $data['semestre'];
        $anio = $data['anio'];

        // Insertar nueva asignación usando usuario_id
        $query = "INSERT INTO asignacion_docentes (usuario_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('iisi', $usuario_id, $curso_id, $semestre, $anio);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignación creada exitosamente.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear la asignación: ' . $stmt->error]);
        }
        break;

    case 'PUT':
        // Actualizar asignación existente (se espera id en query string)
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta id de asignación']);
            break;
        }

        $curso_id = isset($data['curso_id']) ? $data['curso_id'] : null;
        $semestre = isset($data['semestre']) ? $data['semestre'] : null;
        $anio = isset($data['anio']) ? $data['anio'] : null;

        $fields = [];
        $types = '';
        $values = [];
        if ($curso_id !== null) { $fields[] = 'curso_id = ?'; $types .= 'i'; $values[] = $curso_id; }
        if ($semestre !== null) { $fields[] = 'semestre = ?'; $types .= 's'; $values[] = $semestre; }
        if ($anio !== null) { $fields[] = 'anio = ?'; $types .= 'i'; $values[] = $anio; }

        if (count($fields) === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No hay campos para actualizar']);
            break;
        }

        $sql = "UPDATE asignacion_docentes SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        // bind dinamico
        $types .= 'i';
        $values[] = $id;
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignación actualizada correctamente.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar asignación: ' . $stmt->error]);
        }
        break;

    case 'DELETE':
        // Eliminar asignación por id
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta id de asignación']);
            break;
        }

        $query = "DELETE FROM asignacion_docentes WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignación eliminada correctamente.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al eliminar asignación: ' . $stmt->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();
?>