<?php
include_once __DIR__ . '/init_api.php';
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['tarea_id'])) {
            // Obtener entregas de una tarea con calificaciones
            $stmt = $pdo->prepare("
                SELECT e.*, 
                       CONCAT(est.nombres, ' ', est.apellidos) as estudiante_nombre,
                       est.identificacion,
                       c.nota, c.comentarios, c.fecha_calificacion
                FROM entregas e
                LEFT JOIN estudiantes est ON e.estudiante_id = est.id
                LEFT JOIN calificaciones c ON c.estudiante_id = e.estudiante_id 
                    AND c.tarea_id = e.tarea_id
                WHERE e.tarea_id = ?
                ORDER BY e.fecha_entrega DESC
            ");
            $stmt->execute([$_GET['tarea_id']]);
            $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($entregas);
        } elseif (isset($_GET['estudiante_id'])) {
            // Obtener entregas de un estudiante
            $stmt = $pdo->prepare("
                SELECT e.*, t.titulo as tarea_titulo, t.puntos_maximos,
                       c.nombre as curso_nombre,
                       cal.nota, cal.comentarios
                FROM entregas e
                LEFT JOIN tareas t ON e.tarea_id = t.id
                LEFT JOIN cursos c ON t.curso_id = c.id
                LEFT JOIN calificaciones cal ON cal.estudiante_id = e.estudiante_id 
                    AND cal.tarea_id = e.tarea_id
                WHERE e.estudiante_id = ?
                ORDER BY e.fecha_entrega DESC
            ");
            $stmt->execute([$_GET['estudiante_id']]);
            $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($entregas);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Verificar si ya existe una entrega
        $stmt = $pdo->prepare("
            SELECT id FROM entregas 
            WHERE tarea_id = ? AND estudiante_id = ?
        ");
        $stmt->execute([$data['tarea_id'], $data['estudiante_id']]);
        
        if ($stmt->fetch()) {
            // Actualizar entrega existente
            $stmt = $pdo->prepare("
                UPDATE entregas 
                SET fecha_entrega = NOW(), archivo_url = ?
                WHERE tarea_id = ? AND estudiante_id = ?
            ");
            $stmt->execute([
                $data['archivo_url'] ?? null,
                $data['tarea_id'],
                $data['estudiante_id']
            ]);
        } else {
            // Crear nueva entrega
            $stmt = $pdo->prepare("
                INSERT INTO entregas (tarea_id, estudiante_id, fecha_entrega, archivo_url)
                VALUES (?, ?, NOW(), ?)
            ");
            $stmt->execute([
                $data['tarea_id'],
                $data['estudiante_id'],
                $data['archivo_url'] ?? null
            ]);
        }
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM entregas WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        
        echo json_encode(['success' => true]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
