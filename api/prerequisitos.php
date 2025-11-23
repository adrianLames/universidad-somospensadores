<?php
include_once __DIR__ . '/cors.php';
include 'config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener prerequisitos de un curso, cursos donde es prerequisito, o todos los prerequisitos
        $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : 0;
        $es_de = isset($_GET['es_de']) ? intval($_GET['es_de']) : 0;
        if ($curso_id) {
            // Cursos que son prerequisitos de este curso
            $sql = "SELECT p.id, p.curso_id, p.prerequisito_id, c.nombre as prerequisito_nombre FROM prerequisitos p JOIN cursos c ON p.prerequisito_id = c.id WHERE p.curso_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $curso_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $prereqs = [];
            while($row = $result->fetch_assoc()) {
                $prereqs[] = $row;
            }
            echo json_encode(["success" => true, "data" => $prereqs]);
        } else if ($es_de) {
            // Cursos donde este curso es prerequisito de otros
            $sql = "SELECT p.id, p.curso_id, c2.nombre as curso_nombre FROM prerequisitos p JOIN cursos c2 ON p.curso_id = c2.id WHERE p.prerequisito_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $es_de);
            $stmt->execute();
            $result = $stmt->get_result();
            $esDe = [];
            while($row = $result->fetch_assoc()) {
                $esDe[] = $row;
            }
            echo json_encode(["success" => true, "data" => $esDe]);
        } else {
            // Obtener todos los prerequisitos con nombres de cursos y prerequisitos
            $sql = "SELECT p.id, p.curso_id, c1.nombre as curso_nombre, p.prerequisito_id, c2.nombre as prerequisito_nombre FROM prerequisitos p JOIN cursos c1 ON p.curso_id = c1.id JOIN cursos c2 ON p.prerequisito_id = c2.id";
            $result = $conn->query($sql);
            $all = [];
            while($row = $result->fetch_assoc()) {
                $all[] = $row;
            }
            echo json_encode(["success" => true, "data" => $all]);
        }
        break;
    case 'POST':
        // Agregar uno o varios prerequisitos a un curso
        $data = json_decode(file_get_contents("php://input"), true);
        $curso_id = isset($data['curso_id']) ? intval($data['curso_id']) : 0;
        $prerequisitos = isset($data['prerequisitos']) && is_array($data['prerequisitos']) ? $data['prerequisitos'] : [];
        if ($curso_id) {
            // Eliminar todos los prerequisitos actuales del curso
            $del = $conn->prepare("DELETE FROM prerequisitos WHERE curso_id = ?");
            $del->bind_param("i", $curso_id);
            $del->execute();

            // Insertar los nuevos prerequisitos (si hay)
            if (count($prerequisitos) > 0) {
                $stmt = $conn->prepare("INSERT INTO prerequisitos (curso_id, prerequisito_id) VALUES (?, ?)");
                foreach ($prerequisitos as $prereq_id) {
                    $stmt->bind_param("ii", $curso_id, $prereq_id);
                    $stmt->execute();
                }
            }
            echo json_encode(["success" => true, "message" => "Prerequisitos actualizados"]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos curso_id"]);
        }
        break;
    case 'DELETE':
        // Eliminar un prerequisito de un curso
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM prerequisitos WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Prerequisito eliminado"]);
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