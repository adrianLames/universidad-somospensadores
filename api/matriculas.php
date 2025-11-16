<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $estudiante_id = $data['estudiante_id'];
        $curso_id = $data['curso_id'];
        $semestre = $data['semestre'];
        $anio = $data['anio'];

        // Verificar si la matrícula ya existe
        $query = "SELECT COUNT(*) as count FROM matriculas WHERE estudiante_id = ? AND curso_id = ? AND semestre = ? AND anio = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iisi", $estudiante_id, $curso_id, $semestre, $anio);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        if ($row['count'] > 0) {
            echo json_encode(["success" => false, "message" => "La matrícula ya existe."]);
            break;
        }

        // Insertar nueva matrícula
        $query = "INSERT INTO matriculas (estudiante_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iisi", $estudiante_id, $curso_id, $semestre, $anio);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Matrícula creada exitosamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear la matrícula: " . $stmt->error]);
        }
        break;


    case 'GET':
        $estudiante_id = isset($_GET['estudiante_id']) ? intval($_GET['estudiante_id']) : null;
        if ($estudiante_id) {
            $query = "SELECT m.*, c.nombre as curso_nombre, c.codigo as curso_codigo FROM matriculas m INNER JOIN cursos c ON m.curso_id = c.id WHERE m.estudiante_id = ? AND m.estado = 'activa'";
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
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta estudiante_id"]);
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