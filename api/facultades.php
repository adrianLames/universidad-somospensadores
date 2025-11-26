<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener todas las facultades desde la tabla facultades
        $sql = "SELECT id, nombre FROM facultades ORDER BY nombre";
        $result = $conn->query($sql);
        $facultades = [];
        while($row = $result->fetch_assoc()) {
            $facultades[] = $row;
        }
        echo json_encode($facultades);
        break;
    case 'POST':
        // Crear una nueva facultad
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['nombre']) || trim($data['nombre']) === '') {
            http_response_code(400);
            echo json_encode(["error" => "El nombre es obligatorio"]);
            break;
        }
        $nombre = trim($data['nombre']);
        // Verificar si ya existe una facultad con ese nombre
        $check = $conn->prepare("SELECT id FROM facultades WHERE nombre = ?");
        $check->bind_param("s", $nombre);
        $check->execute();
        $check_result = $check->get_result();
        if ($check_result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Ya existe una facultad con ese nombre"]);
            break;
        }
        $sql = "INSERT INTO facultades (nombre) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $nombre);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $conn->insert_id, "nombre" => $nombre]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear la facultad"]);
        }
        break;
    case 'PUT':
        // Editar una facultad existente
        parse_str($_SERVER['QUERY_STRING'], $params);
        $id = isset($params['id']) ? intval($params['id']) : 0;
        $data = json_decode(file_get_contents('php://input'), true);
        if ($id <= 0 || !isset($data['nombre']) || trim($data['nombre']) === '') {
            http_response_code(400);
            echo json_encode(["error" => "ID y nombre requeridos"]);
            break;
        }
        $nombre = trim($data['nombre']);
        // Verificar si ya existe otra facultad con ese nombre
        $check = $conn->prepare("SELECT id FROM facultades WHERE nombre = ? AND id != ?");
        $check->bind_param("si", $nombre, $id);
        $check->execute();
        $check_result = $check->get_result();
        if ($check_result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Ya existe una facultad con ese nombre"]);
            break;
        }
        $sql = "UPDATE facultades SET nombre = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $nombre, $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar la facultad"]);
        }
        break;
    case 'DELETE':
        // Eliminar una facultad existente
        parse_str($_SERVER['QUERY_STRING'], $params);
        $id = isset($params['id']) ? intval($params['id']) : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "ID requerido"]);
            break;
        }
        // Opcional: verificar si hay programas asociados antes de eliminar
        $check = $conn->query("SELECT id FROM programas WHERE facultad_id = $id");
        if ($check && $check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "No se puede eliminar: hay programas asociados a esta facultad"]);
            break;
        }
        $sql = "DELETE FROM facultades WHERE id = $id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar la facultad"]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
