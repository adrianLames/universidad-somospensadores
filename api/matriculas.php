<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $estudiante_id = isset($data['estudiante_id']) ? intval($data['estudiante_id']) : 0;
        $curso_id = isset($data['curso_id']) ? intval($data['curso_id']) : 0;
        $semestre = isset($data['semestre']) ? $data['semestre'] : '';
        $anio = isset($data['anio']) ? intval($data['anio']) : 0;

        // Validar datos requeridos
        if (!$estudiante_id || !$curso_id || !$semestre || !$anio) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]);
            break;
        }

        // Verificar que el curso exista y esté activo
        $query = "SELECT id, nombre FROM cursos WHERE id = ? AND activo = 1";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El curso no existe o no está activo"]);
            break;
        }

        // Verificar si ya existe una matrícula activa del mismo curso (sin importar periodo)
        $query = "SELECT id FROM matriculas WHERE estudiante_id = ? AND curso_id = ? AND estado = 'activa'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $estudiante_id, $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ya tienes una matrícula activa de este curso"]);
            break;
        }

        // Verificar si ya aprobó el curso
        $query = "SELECT id FROM calificaciones WHERE estudiante_id = ? AND curso_id = ? AND estado = 'aprobado'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $estudiante_id, $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ya aprobaste este curso anteriormente"]);
            break;
        }

        // Insertar nueva matrícula
        $query = "INSERT INTO matriculas (estudiante_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iisi", $estudiante_id, $curso_id, $semestre, $anio);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Matrícula creada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear la matrícula: " . $stmt->error]);
        }
        break;


    case 'GET':
        $estudiante_id = isset($_GET['estudiante_id']) ? intval($_GET['estudiante_id']) : null;
        if ($estudiante_id) {
            $query = "SELECT m.*, 
                             c.nombre as curso_nombre, 
                             c.codigo as curso_codigo,
                             c.creditos as curso_creditos,
                             c.programa_id
                      FROM matriculas m 
                      INNER JOIN cursos c ON m.curso_id = c.id 
                      WHERE m.estudiante_id = ? AND m.estado = 'activa'
                      ORDER BY m.fecha_matricula DESC";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $estudiante_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $matriculas = [];
            while ($row = $result->fetch_assoc()) {
                $matriculas[] = $row;
            }
            echo json_encode($matriculas);
        } else {
            // Si no se pasa estudiante_id, devolver todas las matrículas activas
            $query = "SELECT m.*, 
                             c.nombre as curso_nombre, 
                             c.codigo as curso_codigo,
                             c.creditos as curso_creditos,
                             u.nombres, 
                             u.apellidos,
                             u.identificacion
                      FROM matriculas m 
                      INNER JOIN cursos c ON m.curso_id = c.id 
                      INNER JOIN usuarios u ON m.estudiante_id = u.id
                      WHERE m.estado = 'activa'
                      ORDER BY m.fecha_matricula DESC";
            $result = $conn->query($query);
            $matriculas = [];
            while ($row = $result->fetch_assoc()) {
                $matriculas[] = $row;
            }
            echo json_encode($matriculas);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if ($id) {
            // En vez de eliminar, marcamos la matrícula como cancelada
            $query = "UPDATE matriculas SET estado = 'cancelada' WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Matrícula cancelada exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al cancelar la matrícula: " . $stmt->error]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta id"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

$conn->close();
?>