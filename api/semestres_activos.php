<?php
include_once __DIR__ . '/init_api.php';
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['semestre'])) {
                // Obtener cursos activos de un semestre específico
                $semestre = $_GET['semestre'];
                $activo = isset($_GET['activo']) ? $_GET['activo'] : null;
                
                $query = "SELECT sa.*, c.codigo, c.nombre, c.creditos, c.jornada, 
                          p.nombre as programa_nombre, f.nombre as facultad_nombre
                          FROM semestres_activos sa
                          INNER JOIN cursos c ON sa.curso_id = c.id
                          LEFT JOIN programas p ON c.programa_id = p.id
                          LEFT JOIN facultades f ON p.facultad_id = f.id
                          WHERE sa.semestre_academico = ?";
                
                $params = [$semestre];
                
                if ($activo !== null) {
                    $query .= " AND sa.activo = ?";
                    $params[] = $activo;
                }
                
                $query .= " ORDER BY c.codigo";
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $cursos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $cursos]);
                
            } elseif (isset($_GET['curso_id'])) {
                // Verificar si un curso está activo en el semestre actual
                $curso_id = $_GET['curso_id'];
                $semestre = $_GET['semestre_actual'] ?? null;
                
                $query = "SELECT * FROM semestres_activos 
                          WHERE curso_id = ?";
                $params = [$curso_id];
                
                if ($semestre) {
                    $query .= " AND semestre_academico = ?";
                    $params[] = $semestre;
                }
                
                $query .= " AND activo = 1 
                           AND CURDATE() BETWEEN fecha_inicio_matricula AND fecha_fin_matricula";
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $activo = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true, 
                    'activo' => $activo !== false,
                    'data' => $activo ?: null
                ]);
                
            } elseif (isset($_GET['semestres'])) {
                // Listar todos los semestres disponibles
                $query = "SELECT DISTINCT semestre_academico, anio, periodo 
                          FROM semestres_activos 
                          ORDER BY anio DESC, periodo DESC";
                $stmt = $pdo->query($query);
                $semestres = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $semestres]);
                
            } else {
                // Listar todos los semestres activos
                $query = "SELECT sa.*, c.codigo, c.nombre, c.creditos, c.jornada,
                          p.nombre as programa_nombre, f.nombre as facultad_nombre
                          FROM semestres_activos sa
                          INNER JOIN cursos c ON sa.curso_id = c.id
                          LEFT JOIN programas p ON c.programa_id = p.id
                          LEFT JOIN facultades f ON p.facultad_id = f.id
                          ORDER BY sa.semestre_academico DESC, c.codigo";
                
                $stmt = $pdo->query($query);
                $semestres = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $semestres]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['bulk_insert'])) {
                // Inserción masiva de cursos para un semestre
                $semestre = $data['semestre_academico'] ?? null;
                $anio = $data['anio'] ?? null;
                $periodo = $data['periodo'] ?? null;
                $fecha_inicio = $data['fecha_inicio_matricula'] ?? null;
                $fecha_fin = $data['fecha_fin_matricula'] ?? null;
                $cursos_ids = $data['cursos_ids'] ?? []; // Array de IDs de cursos
                $cupos = $data['cupos_disponibles'] ?? null;
                
                // Validar datos requeridos
                if (!$semestre || !$anio || !$periodo || !$fecha_inicio || !$fecha_fin) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Faltan datos requeridos (semestre, año, periodo, fechas)'
                    ]);
                    break;
                }
                
                if (empty($cursos_ids) || !is_array($cursos_ids)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Debe proporcionar al menos un curso'
                    ]);
                    break;
                }
                
                $pdo->beginTransaction();
                
                try {
                    $stmt = $pdo->prepare("
                        INSERT INTO semestres_activos 
                        (curso_id, semestre_academico, anio, periodo, fecha_inicio_matricula, 
                         fecha_fin_matricula, cupos_disponibles, activo)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                        ON DUPLICATE KEY UPDATE 
                        fecha_inicio_matricula = VALUES(fecha_inicio_matricula),
                        fecha_fin_matricula = VALUES(fecha_fin_matricula),
                        cupos_disponibles = VALUES(cupos_disponibles),
                        activo = 1
                    ");
                    
                    $insertados = 0;
                    foreach ($cursos_ids as $curso_id) {
                        $stmt->execute([
                            $curso_id, $semestre, $anio, $periodo, 
                            $fecha_inicio, $fecha_fin, $cupos
                        ]);
                        $insertados++;
                    }
                    
                    $pdo->commit();
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Cursos activados para el semestre',
                        'count' => $insertados
                    ]);
                    
                } catch (Exception $e) {
                    $pdo->rollBack();
                    http_response_code(500);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Error al activar cursos: ' . $e->getMessage()
                    ]);
                }
                
            } else {
                // Inserción individual
                $stmt = $pdo->prepare("
                    INSERT INTO semestres_activos 
                    (curso_id, semestre_academico, anio, periodo, fecha_inicio_matricula, 
                     fecha_fin_matricula, cupos_disponibles, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['curso_id'],
                    $data['semestre_academico'],
                    $data['anio'],
                    $data['periodo'],
                    $data['fecha_inicio_matricula'],
                    $data['fecha_fin_matricula'],
                    $data['cupos_disponibles'] ?? null,
                    $data['activo'] ?? 1
                ]);
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Curso agregado al semestre',
                    'id' => $pdo->lastInsertId()
                ]);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'];
            
            $stmt = $pdo->prepare("
                UPDATE semestres_activos 
                SET fecha_inicio_matricula = ?,
                    fecha_fin_matricula = ?,
                    cupos_disponibles = ?,
                    activo = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['fecha_inicio_matricula'],
                $data['fecha_fin_matricula'],
                $data['cupos_disponibles'] ?? null,
                $data['activo'] ?? 1,
                $id
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Semestre actualizado']);
            break;
            
        case 'DELETE':
            // Desactivar curso del semestre (soft delete)
            $id = $_GET['id'] ?? null;
            
            if ($id) {
                $stmt = $pdo->prepare("UPDATE semestres_activos SET activo = 0 WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Curso desactivado del semestre']);
            } else {
                echo json_encode(['success' => false, 'message' => 'ID requerido']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
