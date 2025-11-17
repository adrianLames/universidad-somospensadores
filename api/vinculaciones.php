<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $docente_id = $data['docente_id'];
        $curso_id = $data['curso_id'];
        $anio = isset($data['anio']) ? $data['anio'] : date('Y');
        $semestre = isset($data['semestre']) ? $data['semestre'] : 1;

        // Validar que no exista ya la asignación
        $sql_check = "SELECT id FROM asignacion_docentes WHERE docente_id=? AND curso_id=? AND anio=? AND semestre=?";
        $stmt_check = $conn->prepare($sql_check);
        $stmt_check->bind_param("iiii", $docente_id, $curso_id, $anio, $semestre);
        $stmt_check->execute();
        $stmt_check->store_result();
        if ($stmt_check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Ya existe esta asignación para el docente y curso en el periodo indicado."]);
            break;
        }

        $sql = "INSERT INTO asignacion_docentes (docente_id, curso_id, anio, semestre) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiii", $docente_id, $curso_id, $anio, $semestre);
        if($stmt->execute()) {
            echo json_encode(["message" => "Vinculación realizada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al vincular: " . $stmt->error]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
