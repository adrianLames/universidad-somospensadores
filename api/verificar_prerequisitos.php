<?php
include_once __DIR__ . '/cors.php';
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;
    $estudiante_id = isset($_GET['estudiante_id']) ? intval($_GET['estudiante_id']) : null;

    if ($curso_id && $estudiante_id) {
        $query = "SELECT c2.id, c2.nombre, c2.descripcion, 
                         CASE WHEN cal.estado = 'aprobado' THEN 1 ELSE 0 END AS aprobado
                  FROM cursos c1
                  INNER JOIN cursos c2 ON c1.prerequisito_id = c2.id
                  LEFT JOIN calificaciones cal ON cal.curso_id = c2.id AND cal.estudiante_id = ?
                  WHERE c1.id = ?";

        $stmt = $conn->prepare($query);
        $stmt->bind_param('ii', $estudiante_id, $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $prerequisitos = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode(['success' => true, 'data' => $prerequisitos]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID del curso o estudiante no proporcionado.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}

$conn->close();

?>