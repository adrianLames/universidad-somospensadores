<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;
        $docente_id = isset($_GET['docente_id']) ? intval($_GET['docente_id']) : null;

        if ($curso_id) {
            // Obtener el profesor asignado a un curso específico
            $query = "SELECT u.id, u.nombres, u.apellidos, u.email FROM asignacion_docentes ad
                      INNER JOIN usuarios u ON ad.docente_id = u.id
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
                      WHERE ad.docente_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param('i', $docente_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $asignaciones = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode(['success' => true, 'data' => $asignaciones]);
        } else {
            // Obtener todas las materias creadas
            $query = "SELECT id, nombre FROM cursos WHERE activo = 1";
            $result = $conn->query($query);
            $cursos = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode(['success' => true, 'data' => $cursos]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $docente_id = $data['docente_id'];
        $curso_id = $data['curso_id'];
        $semestre = $data['semestre'];
        $anio = $data['anio'];

        // Insertar nueva asignación
        $query = "INSERT INTO asignacion_docentes (docente_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('iisi', $docente_id, $curso_id, $semestre, $anio);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignación creada exitosamente.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear la asignación: ' . $stmt->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();
?>