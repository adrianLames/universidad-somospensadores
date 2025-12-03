<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if (!$conn) {
        throw new Exception('Error de conexión a la base de datos');
    }

    switch($method) {
        case 'GET':
            $docente_id = isset($_GET['docente_id']) ? intval($_GET['docente_id']) : null;
            
            if ($docente_id) {
                $query = "SELECT ad.*, 
                                 c.id as curso_id,
                                 c.nombre as curso_nombre, 
                                 c.codigo as curso_codigo,
                                 c.creditos as curso_creditos,
                                 c.jornada,
                                 c.programa_id,
                                 c.activo,
                                 p.nombre as programa_nombre,
                                 (SELECT COUNT(*) 
                                  FROM matriculas m 
                                  WHERE m.curso_id = c.id 
                                  AND m.estado = 'activa'
                                  AND m.anio = ad.anio
                                  AND m.semestre = ad.semestre) as total_estudiantes
                          FROM asignacion_docentes ad 
                          INNER JOIN cursos c ON ad.curso_id = c.id 
                          LEFT JOIN programas p ON c.programa_id = p.id
                          WHERE ad.usuario_id = ?
                          ORDER BY ad.anio DESC, ad.semestre DESC";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("i", $docente_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $vinculaciones = [];
                while ($row = $result->fetch_assoc()) {
                    $vinculaciones[] = $row;
                }
                echo json_encode($vinculaciones);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "ID de docente no proporcionado"]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['usuario_id']) || !isset($data['curso_id'])) {
                http_response_code(400);
                echo json_encode(["error" => "Datos inválidos o incompletos"]);
                break;
            }

            $usuario_id = $data['usuario_id'];
            $curso_id = $data['curso_id'];
            $anio = isset($data['anio']) ? $data['anio'] : date('Y');
            $semestre = isset($data['semestre']) ? $data['semestre'] : 1;

            // Validar que no exista ya la asignación
            $sql_check = "SELECT id FROM asignacion_docentes WHERE usuario_id=? AND curso_id=? AND anio=? AND semestre=?";
            $stmt_check = $conn->prepare($sql_check);
            $stmt_check->bind_param("iiii", $usuario_id, $curso_id, $anio, $semestre);
            $stmt_check->execute();
            $stmt_check->store_result();
            if ($stmt_check->num_rows > 0) {
                http_response_code(409);
                echo json_encode(["error" => "Ya existe esta asignación para el docente y curso en el periodo indicado."]);
                break;
            }

            $sql = "INSERT INTO asignacion_docentes (usuario_id, curso_id, anio, semestre) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiii", $usuario_id, $curso_id, $anio, $semestre);
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>
