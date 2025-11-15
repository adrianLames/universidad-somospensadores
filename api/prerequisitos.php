<?php

require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;

    if ($curso_id) {
        $query = "SELECT c2.id, c2.nombre, c2.descripcion FROM cursos c1
                  INNER JOIN cursos c2 ON c1.prerequisito_id = c2.id
                  WHERE c1.id = ?";

        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $prerequisitos = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode(['success' => true, 'data' => $prerequisitos]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID del curso no proporcionado.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}

?>