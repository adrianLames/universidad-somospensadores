<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $estudiante_id = isset($data['estudiante_id']) ? intval($data['estudiante_id']) : 0;
        $curso_id = isset($data['curso_id']) ? intval($data['curso_id']) : 0;
        $semestre = isset($data['semestre']) ? $data['semestre'] : '';
        $anio = isset($data['anio']) ? intval($data['anio']) : 0;

        // Validar datos requeridos
        if (!$estudiante_id || !$curso_id || !$semestre || !$anio) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]);
            break;
        }

        // 1. Verificar que el curso esté activo para el semestre actual
        $semestre_academico = $anio . '-' . $semestre;
        $query = "SELECT sa.* FROM semestres_activos sa 
                  WHERE sa.curso_id = ? 
                  AND sa.semestre_academico = ? 
                  AND sa.activo = 1
                  AND CURDATE() BETWEEN sa.fecha_inicio_matricula AND sa.fecha_fin_matricula";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("is", $curso_id, $semestre_academico);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Este curso no está disponible para matrícula en el periodo actual o el periodo de matrícula ha cerrado"
            ]);
            break;
        }
        
        $semestre_activo = $result->fetch_assoc();

        // 2. Verificar cupos disponibles
        if ($semestre_activo['cupos_disponibles'] !== null) {
            $query_cupos = "SELECT COUNT(*) as total FROM matriculas 
                            WHERE curso_id = ? AND semestre = ? AND anio = ? AND estado = 'activa'";
            $stmt_cupos = $conn->prepare($query_cupos);
            $stmt_cupos->bind_param("isi", $curso_id, $semestre, $anio);
            $stmt_cupos->execute();
            $result_cupos = $stmt_cupos->get_result();
            $cupos_ocupados = $result_cupos->fetch_assoc()['total'];
            
            if ($cupos_ocupados >= $semestre_activo['cupos_disponibles']) {
                http_response_code(400);
                echo json_encode([
                    "success" => false, 
                    "message" => "No hay cupos disponibles para este curso"
                ]);
                break;
            }
        }

        // 3. Verificar prerequisitos del curso
        $query_prereq = "SELECT p.prerequisito_id, c.nombre 
                         FROM prerequisitos p
                         INNER JOIN cursos c ON p.prerequisito_id = c.id
                         WHERE p.curso_id = ?";
        $stmt_prereq = $conn->prepare($query_prereq);
        $stmt_prereq->bind_param("i", $curso_id);
        $stmt_prereq->execute();
        $result_prereq = $stmt_prereq->get_result();
        
        $prerequisitos_faltantes = [];
        
        while ($prereq = $result_prereq->fetch_assoc()) {
            // Verificar si el estudiante ha aprobado este prerequisito
            $query_calif = "SELECT estado FROM calificaciones 
                            WHERE estudiante_id = ? 
                            AND curso_id = ? 
                            AND estado = 'aprobado'";
            $stmt_calif = $conn->prepare($query_calif);
            $stmt_calif->bind_param("ii", $estudiante_id, $prereq['prerequisito_id']);
            $stmt_calif->execute();
            $result_calif = $stmt_calif->get_result();
            
            if ($result_calif->num_rows === 0) {
                $prerequisitos_faltantes[] = $prereq['nombre'];
            }
        }
        
        if (count($prerequisitos_faltantes) > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "No cumples con los prerequisitos. Debes aprobar: " . implode(', ', $prerequisitos_faltantes)
            ]);
            break;
        }

        // 4. Verificar que el curso exista y esté activo
        $query = "SELECT id, nombre FROM cursos WHERE id = ? AND activo = 1";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El curso no existe o no está activo"]);
            break;
        }

        // 5. Verificar si ya existe una matrícula activa del mismo curso
        $query = "SELECT id FROM matriculas WHERE estudiante_id = ? AND curso_id = ? AND estado = 'activa'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $estudiante_id, $curso_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ya tienes una matrícula activa de este curso"]);
            break;
        }

        // 6. Verificar si existe matrícula en el mismo periodo
        $query = "SELECT id, estado FROM matriculas WHERE estudiante_id = ? AND curso_id = ? AND semestre = ? AND anio = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iisi", $estudiante_id, $curso_id, $semestre, $anio);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $existente = $result->fetch_assoc();
            
            if ($existente['estado'] === 'activa') {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Ya tienes una matrícula activa en este periodo"]);
                break;
            } else if ($existente['estado'] === 'cancelada') {
                // Re-activar la matrícula cancelada
                $update_query = "UPDATE matriculas SET estado = 'activa', fecha_matricula = NOW() WHERE id = ?";
                $update_stmt = $conn->prepare($update_query);
                $update_stmt->bind_param("i", $existente['id']);
                
                if ($update_stmt->execute()) {
                    echo json_encode(["success" => true, "message" => "Matrícula reactivada exitosamente"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["success" => false, "message" => "Error al reactivar la matrícula: " . $update_stmt->error]);
                }
                break;
            }
        }

        // 7. Crear nueva matrícula
        $query = "INSERT INTO matriculas (estudiante_id, curso_id, semestre, anio) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iisi", $estudiante_id, $curso_id, $semestre, $anio);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Matrícula creada exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear la matrícula: " . $stmt->error]);
        }
        break;


    case 'GET':
        $estudiante_id = isset($_GET['estudiante_id']) ? intval($_GET['estudiante_id']) : null;
        $curso_id = isset($_GET['curso_id']) ? intval($_GET['curso_id']) : null;
        $programa_id = isset($_GET['programa_id']) ? intval($_GET['programa_id']) : null;
        $jornada = isset($_GET['jornada']) ? $_GET['jornada'] : null;
        
        if ($estudiante_id) {
            $query = "SELECT m.*, 
                             c.nombre as curso_nombre, 
                             c.codigo as curso_codigo,
                             c.creditos as curso_creditos,
                             c.programa_id,
                             c.jornada
                      FROM matriculas m 
                      INNER JOIN cursos c ON m.curso_id = c.id 
                      WHERE m.estudiante_id = ? AND m.estado = 'activa'
                      ORDER BY m.fecha_matricula DESC";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $estudiante_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $matriculas = [];
            while ($row = $result->fetch_assoc()) {
                $matriculas[] = $row;
            }
            echo json_encode($matriculas);
        } elseif ($curso_id) {
            // Obtener estudiantes matriculados en un curso específico
            $query = "SELECT m.*, 
                             c.nombre as curso_nombre, 
                             c.codigo as curso_codigo,
                             c.creditos as curso_creditos,
                             c.programa_id,
                             c.jornada,
                             u.nombres, 
                             u.apellidos,
                             u.identificacion,
                             u.email
                      FROM matriculas m 
                      INNER JOIN cursos c ON m.curso_id = c.id 
                      INNER JOIN usuarios u ON m.estudiante_id = u.id
                      WHERE m.curso_id = ? AND m.estado = 'activa'
                      ORDER BY u.apellidos, u.nombres";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $curso_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $matriculas = [];
            while ($row = $result->fetch_assoc()) {
                $matriculas[] = $row;
            }
            echo json_encode($matriculas);
        } else {
            // Si no se pasa estudiante_id ni curso_id, devolver todas las matrículas activas con filtros opcionales
            $query = "SELECT m.*, 
                             c.nombre as curso_nombre, 
                             c.codigo as curso_codigo,
                             c.creditos as curso_creditos,
                             c.programa_id,
                             c.jornada,
                             u.nombres, 
                             u.apellidos,
                             u.identificacion
                      FROM matriculas m 
                      INNER JOIN cursos c ON m.curso_id = c.id 
                      INNER JOIN usuarios u ON m.estudiante_id = u.id
                      WHERE m.estado = 'activa'";
            
            if ($programa_id) {
                $query .= " AND c.programa_id = " . intval($programa_id);
            }
            
            if ($jornada) {
                $query .= " AND c.jornada = '" . $conn->real_escape_string($jornada) . "'";
            }
            
            $query .= " ORDER BY m.fecha_matricula DESC";
            
            $result = $conn->query($query);
            $matriculas = [];
            while ($row = $result->fetch_assoc()) {
                $matriculas[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $matriculas]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if ($id) {
            // En vez de eliminar, marcamos la matrícula como cancelada
            $query = "UPDATE matriculas SET estado = 'cancelada' WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Matrícula cancelada exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error al cancelar la matrícula: " . $stmt->error]);
            }
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