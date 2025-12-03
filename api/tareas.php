<?php
include_once __DIR__ . '/init_api.php';
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Obtener una tarea específica
            $stmt = $pdo->prepare("
                SELECT t.*, c.nombre as curso_nombre, c.codigo as curso_codigo,
                       CONCAT(u.nombres, ' ', u.apellidos) as docente_nombre
                FROM tareas t
                LEFT JOIN cursos c ON t.curso_id = c.id
                LEFT JOIN usuarios u ON t.docente_id = u.id
                WHERE t.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $tarea = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($tarea);
        } elseif (isset($_GET['curso_id'])) {
            // Obtener todas las tareas de un curso
            $stmt = $pdo->prepare("
                SELECT t.*, CONCAT(u.nombres, ' ', u.apellidos) as docente_nombre
                FROM tareas t
                LEFT JOIN usuarios u ON t.docente_id = u.id
                WHERE t.curso_id = ?
                ORDER BY t.fecha_entrega DESC
            ");
            $stmt->execute([$_GET['curso_id']]);
            $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tareas);
        } else {
            // Obtener todas las tareas
            $stmt = $pdo->query("
                SELECT t.*, c.nombre as curso_nombre, c.codigo as curso_codigo,
                       CONCAT(u.nombres, ' ', u.apellidos) as docente_nombre
                FROM tareas t
                LEFT JOIN cursos c ON t.curso_id = c.id
                LEFT JOIN usuarios u ON t.docente_id = u.id
                ORDER BY t.fecha_creacion DESC
            ");
            $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tareas);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO tareas (curso_id, docente_id, titulo, descripcion, fecha_entrega, puntos_maximos, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $data['curso_id'],
            $data['docente_id'],
            $data['titulo'],
            $data['descripcion'],
            $data['fecha_entrega'],
            $data['puntos_maximos'] ?? 100
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE tareas 
            SET titulo = ?, descripcion = ?, fecha_entrega = ?, puntos_maximos = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['titulo'],
            $data['descripcion'],
            $data['fecha_entrega'],
            $data['puntos_maximos'],
            $_GET['id']
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM tareas WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        
        echo json_encode(['success' => true]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
