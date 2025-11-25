<?php
include_once __DIR__ . '/cors.php';
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;
    $estudiante_id = isset($_GET['estudiante_id']) ? intval($_GET['estudiante_id']) : null;

    if ($curso_id && $estudiante_id) {
        // Obtener prerequisitos del curso usando la tabla prerequisitos (relación N a N)
        $query = "SELECT c.id, c.codigo, c.nombre, c.descripcion, c.creditos,
                         CASE 
                            WHEN cal.estado = 'aprobado' THEN 1 
                            ELSE 0 
                         END AS aprobado,
                         cal.nota_final
                  FROM prerequisitos p
                  INNER JOIN cursos c ON p.prerequisito_id = c.id
                  LEFT JOIN calificaciones cal ON cal.curso_id = c.id AND cal.estudiante_id = ? AND cal.estado = 'aprobado'
                  WHERE p.curso_id = ?
                  ORDER BY c.nombre";

        $stmt = $conn->prepare($query);
        $stmt->bind_param('ii', $estudiante_id, $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $prerequisitos = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode(['success' => true, 'data' => $prerequisitos]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID del curso o estudiante no proporcionado.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}

$conn->close();

?>