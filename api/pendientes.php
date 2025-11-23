<?php
include_once __DIR__ . '/cors.php';
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT p.*, pr.nombre as programa_nombre FROM pendientes p LEFT JOIN programas pr ON p.programa_id = pr.id WHERE p.estado = 'pendiente'";
        $result = $conn->query($sql);
        $items = [];
        while($row = $result->fetch_assoc()) {
            unset($row['password_hash']);
            $items[] = $row;
        }
        echo json_encode($items);
        break;

    case 'POST':
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if($data === null) {
            parse_str($raw, $parsed);
            $data = !empty($parsed) ? $parsed : [];
        }

        // Si se envía 'action' en POST, tratarla como petición de procesar pendiente (fallback cuando PUT falla)
        if(isset($data['action'])) {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if(!$id && isset($data['id'])) $id = intval($data['id']);

            $action = $data['action'];
            if($action === 'approve') {
                $conn->begin_transaction();
                try {
                    $stmt = $conn->prepare("SELECT * FROM pendientes WHERE id = ? AND estado = 'pendiente' FOR UPDATE");
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    $res = $stmt->get_result();
                    if($res->num_rows === 0) {
                        $conn->rollback();
                        http_response_code(404);
                        echo json_encode(["error" => "Registro pendiente no encontrado o ya procesado"]);
                        break;
                    }
                    $row = $res->fetch_assoc();
                    if(isset($data['tipo']) && in_array($data['tipo'], ['admin','docente','estudiante'])) {
                        $row['tipo'] = $data['tipo'];
                    }

                    $force = isset($data['force']) && ($data['force'] === true || $data['force'] === 'true' || $data['force'] === 1 || $data['force'] === '1');

                    $check = $conn->prepare("SELECT id FROM usuarios WHERE identificacion = ? OR email = ? LIMIT 1");
                    $check->bind_param("ss", $row['identificacion'], $row['email']);
                    $check->execute();
                    $checkRes = $check->get_result();
                    if($checkRes->num_rows > 0) {
                        $existing = $checkRes->fetch_assoc();
                        $existingId = $existing['id'];
                        if($force) {
                            // Actualizar datos del usuario existente con la info del pendiente (incluye password_hash)
                            $updUser = $conn->prepare("UPDATE usuarios SET tipo = ?, identificacion = ?, nombres = ?, apellidos = ?, email = ?, telefono = ?, fecha_nacimiento = ?, direccion = ?, facultad_id = ?, programa_id = ?, password_hash = ? WHERE id = ?");
                            $updUser->bind_param("sssssssssssi",
                                $row['tipo'],
                                $row['identificacion'],
                                $row['nombres'],
                                $row['apellidos'],
                                $row['email'],
                                $row['telefono'],
                                $row['fecha_nacimiento'],
                                $row['direccion'],
                                (isset($row['facultad_id']) ? $row['facultad_id'] : null),
                                $row['programa_id'],
                                $row['password_hash'],
                                $existingId
                            );
                            $updUser->execute();

                            // Asegurar fila en la tabla específica
                            if($row['tipo'] === 'estudiante') {
                                $chkSpec = $conn->prepare("SELECT id FROM estudiantes WHERE usuario_id = ? LIMIT 1");
                                $chkSpec->bind_param("i", $existingId);
                                $chkSpec->execute();
                                $rSpec = $chkSpec->get_result();
                                if($rSpec->num_rows === 0) {
                                    $insSpec = $conn->prepare("INSERT INTO estudiantes (usuario_id, facultad_id, programa_id) VALUES (?, ?, ?)");
                                    $insSpec->bind_param("iii", $existingId, (isset($row['facultad_id']) ? $row['facultad_id'] : null), $row['programa_id']);
                                    $insSpec->execute();
                                }
                            } else if($row['tipo'] === 'docente') {
                                $chkSpec = $conn->prepare("SELECT id FROM docentes WHERE usuario_id = ? LIMIT 1");
                                $chkSpec->bind_param("i", $existingId);
                                $chkSpec->execute();
                                $rSpec = $chkSpec->get_result();
                                if($rSpec->num_rows === 0) {
                                    $codigo_docente = 'DOC-' . $existingId;
                                    $fecha_vinculacion = date('Y-m-d');
                                    $facultad_id = (isset($row['facultad_id']) && is_numeric($row['facultad_id'])) ? intval($row['facultad_id']) : null;
                                    $programa_id = (isset($row['programa_id']) && is_numeric($row['programa_id'])) ? intval($row['programa_id']) : null;
                                    $insSpec = $conn->prepare("INSERT INTO docentes (usuario_id, facultad_id, programa_id, codigo_docente, fecha_vinculacion) VALUES (?, ?, ?, ?, ?)");
                                    $insSpec->bind_param("iiiss", $existingId, $facultad_id, $programa_id, $codigo_docente, $fecha_vinculacion);
                                    $insSpec->execute();
                                }
                            } else if($row['tipo'] === 'admin') {
                                $chkSpec = $conn->prepare("SELECT id FROM administradores WHERE usuario_id = ? LIMIT 1");
                                $chkSpec->bind_param("i", $existingId);
                                $chkSpec->execute();
                                $rSpec = $chkSpec->get_result();
                                if($rSpec->num_rows === 0) {
                                    $insSpec = $conn->prepare("INSERT INTO administradores (usuario_id) VALUES (?)");
                                    $insSpec->bind_param("i", $existingId);
                                    $insSpec->execute();
                                }
                            }

                            // Marcar como aprobado
                            $upd = $conn->prepare("UPDATE pendientes SET estado = 'aprobado' WHERE id = ?");
                            $upd->bind_param("i", $id);
                            $upd->execute();
                            $conn->commit();
                            echo json_encode(["message" => "Registro aprobado (reutilizado usuario existente)", "usuario_id" => $existingId]);
                            break;
                        } else {
                            $conn->rollback();
                            http_response_code(409);
                            echo json_encode(["error" => "Ya existe un usuario con la misma identificación o email"]);
                            break;
                        }
                    }

                    // Insertar en usuarios con password_hash existente
                    $sql = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad_id, programa_id, password_hash, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
                    $ins = $conn->prepare($sql);
                    $facultad_id = isset($row['facultad_id']) ? $row['facultad_id'] : null;
                    $ins->bind_param("sssssssssss",
                        $row['tipo'],
                        $row['identificacion'],
                        $row['nombres'],
                        $row['apellidos'],
                        $row['email'],
                        $row['telefono'],
                        $row['fecha_nacimiento'],
                        $row['direccion'],
                        $facultad_id,
                        $row['programa_id'],
                        $row['password_hash']
                    );
                    if(!$ins->execute()) {
                        $conn->rollback();
                        http_response_code(500);
                        echo json_encode(["error" => "Error al insertar usuario: " . $ins->error]);
                        break;
                    }
                    $newUserId = $conn->insert_id;
                    if($row['tipo'] === 'estudiante') {
                        // Insertar con facultad_id y programa_id si existen
                        if (!empty($row['facultad_id']) || !empty($row['programa_id'])) {
                            $facultad_id = isset($row['facultad_id']) ? $row['facultad_id'] : null;
                            $programa_id = isset($row['programa_id']) ? $row['programa_id'] : null;
                            $stmt2 = $conn->prepare("INSERT INTO estudiantes (usuario_id, facultad_id, programa_id) VALUES (?, ?, ?)");
                            $stmt2->bind_param("iii", $newUserId, $facultad_id, $programa_id);
                        } else {
                            $stmt2 = $conn->prepare("INSERT INTO estudiantes (usuario_id) VALUES (?)");
                            $stmt2->bind_param("i", $newUserId);
                        }
                        $stmt2->execute();
                    } else if($row['tipo'] === 'docente') {
                        // Insertar con facultad_id y programa_id si existen
                        if (!empty($row['facultad_id']) || !empty($row['programa_id'])) {
                            $facultad_id = isset($row['facultad_id']) ? $row['facultad_id'] : null;
                            $programa_id = isset($row['programa_id']) ? $row['programa_id'] : null;
                            $stmt2 = $conn->prepare("INSERT INTO docentes (usuario_id, facultad_id, programa_id) VALUES (?, ?, ?)");
                            $stmt2->bind_param("iii", $newUserId, $facultad_id, $programa_id);
                        } else {
                            $stmt2 = $conn->prepare("INSERT INTO docentes (usuario_id) VALUES (?)");
                            $stmt2->bind_param("i", $newUserId);
                        }
                        $stmt2->execute();
                    } else if($row['tipo'] === 'admin') {
                        $stmt2 = $conn->prepare("INSERT INTO administradores (usuario_id) VALUES (?)");
                        $stmt2->bind_param("i", $newUserId);
                        $stmt2->execute();
                    }
                    $upd = $conn->prepare("UPDATE pendientes SET estado = 'aprobado' WHERE id = ?");
                    $upd->bind_param("i", $id);
                    $upd->execute();
                    $conn->commit();
                    echo json_encode(["message" => "Registro aprobado", "usuario_id" => $newUserId]);
                } catch (Exception $e) {
                    $conn->rollback();
                    http_response_code(500);
                    echo json_encode([
                        "error" => "Excepción al procesar: " . $e->getMessage(),
                        "trace" => $e->getTraceAsString()
                    ]);
                }
            } else if($action === 'reject') {
                $stmt = $conn->prepare("UPDATE pendientes SET estado = 'rechazado' WHERE id = ? AND estado = 'pendiente'");
                $stmt->bind_param("i", $id);
                if($stmt->execute()) {
                    echo json_encode(["message" => "Registro rechazado"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al rechazar registro"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Acción desconocida"]);
            }
            break;
        }

        // Si no es procesamiento, continuar con creación normal
        if(!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            break;
        }

        if(!isset($data['password']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "La contraseña es requerida"]);
            break;
        }


        // Validar que la identificación y el email no existan en usuarios ni en pendientes (pendiente o aprobado)
        $identificacion = $data['identificacion'];
        $email = $data['email'];
        $check = $conn->prepare("SELECT id FROM usuarios WHERE identificacion = ? OR email = ? LIMIT 1");
        $check->bind_param("ss", $identificacion, $email);
        $check->execute();
        $res = $check->get_result();
        if ($res->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Ya existe un usuario registrado con esa identificación o email."]);
            break;
        }
        $check2 = $conn->prepare("SELECT id FROM pendientes WHERE (identificacion = ? OR email = ?) AND estado IN ('pendiente','aprobado') LIMIT 1");
        $check2->bind_param("ss", $identificacion, $email);
        $check2->execute();
        $res2 = $check2->get_result();
        if ($res2->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Ya existe una solicitud pendiente o aprobada con esa identificación o email."]);
            break;
        }

        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

        $sql = "INSERT INTO pendientes (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, facultad_id, programa_id, password_hash, direccion, estado, fecha_solicitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())";
        $stmt = $conn->prepare($sql);
        $facultad_id = isset($data['facultad']) ? $data['facultad'] : (isset($data['facultad_id']) ? $data['facultad_id'] : null);
        $programa_id = isset($data['programa_id']) ? $data['programa_id'] : null;
        $stmt->bind_param("sssssssssss",
            $data['tipo'],
            $data['identificacion'],
            $data['nombres'],
            $data['apellidos'],
            $data['email'],
            $data['telefono'],
            $data['fecha_nacimiento'],
            $facultad_id,
            $programa_id,
            $password_hash,
            $data['direccion']
        );

        if($stmt->execute()) {
            echo json_encode(["message" => "Registro en pendientes creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear registro: " . $stmt->error]);
        }
        break;

    case 'PUT':
        // Aprobar o rechazar un registro pendiente
        $raw = file_get_contents("php://input");
        error_log("pendientes.php PUT raw input length=" . strlen($raw));
        $data = json_decode($raw, true);
        // fallback: si json_decode falla, intentar parse_str (en caso de urlencoded) o usar query params
        if($data === null) {
            parse_str($raw, $parsed);
            if(!empty($parsed)) {
                $data = $parsed;
            } else {
                $data = [];
                if(isset($_GET['action'])) $data['action'] = $_GET['action'];
                if(isset($_GET['tipo'])) $data['tipo'] = $_GET['tipo'];
            }
        }

        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        // fallback: aceptar id desde el body json/urlencoded
        if(!$id && isset($data['id'])) {
            $id = intval($data['id']);
        }

        if(!$id || !isset($data['action'])) {
            http_response_code(400);
            $parsedKeys = is_array($data) ? array_keys($data) : [];
            echo json_encode([
                "error" => "Parámetros inválidos",
                "hint" => strlen($raw) === 0 ? "request body vacío" : "body recibido pero no contiene 'action' o 'id'",
                "debug" => [
                    "raw_length" => strlen($raw),
                    "parsed_keys" => $parsedKeys,
                    "get_params" => $_GET
                ]
            ]);
            break;
        }

        $action = $data['action'];

        if($action === 'approve') {
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("SELECT * FROM pendientes WHERE id = ? AND estado = 'pendiente' FOR UPDATE");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $res = $stmt->get_result();
                if($res->num_rows === 0) {
                    $conn->rollback();
                    http_response_code(404);
                    echo json_encode(["error" => "Registro pendiente no encontrado o ya procesado"]);
                    break;
                }
                $row = $res->fetch_assoc();

                // Permitir override del tipo si el admin lo especifica en la petición
                if(isset($data['tipo']) && in_array($data['tipo'], ['admin','docente','estudiante'])) {
                    $row['tipo'] = $data['tipo'];
                }

                // Verificar duplicados en usuarios
                $force = isset($data['force']) && ($data['force'] === true || $data['force'] === 'true' || $data['force'] === 1 || $data['force'] === '1');

                $check = $conn->prepare("SELECT id FROM usuarios WHERE identificacion = ? OR email = ? LIMIT 1");
                $check->bind_param("ss", $row['identificacion'], $row['email']);
                $check->execute();
                $checkRes = $check->get_result();
                if($checkRes->num_rows > 0) {
                    $existing = $checkRes->fetch_assoc();
                    $existingId = $existing['id'];
                    if($force) {
                        // Actualizar datos del usuario existente
                        $updUser = $conn->prepare("UPDATE usuarios SET tipo = ?, identificacion = ?, nombres = ?, apellidos = ?, email = ?, telefono = ?, fecha_nacimiento = ?, direccion = ?, facultad = ?, programa_id = ?, password_hash = ? WHERE id = ?");
                        $updUser->bind_param("sssssssssssi",
                            $row['tipo'],
                            $row['identificacion'],
                            $row['nombres'],
                            $row['apellidos'],
                            $row['email'],
                            $row['telefono'],
                            $row['fecha_nacimiento'],
                            $row['direccion'],
                            $row['facultad'],
                            $row['programa_id'],
                            $row['password_hash'],
                            $existingId
                        );
                        $updUser->execute();

                        // Asegurar fila en la tabla específica
                        if($row['tipo'] === 'estudiante') {
                            $chkSpec = $conn->prepare("SELECT id FROM estudiantes WHERE usuario_id = ? LIMIT 1");
                            $chkSpec->bind_param("i", $existingId);
                            $chkSpec->execute();
                            $rSpec = $chkSpec->get_result();
                            if($rSpec->num_rows === 0) {
                                    $insSpec = $conn->prepare("INSERT INTO estudiantes (usuario_id, facultad, programa_id) VALUES (?, ?, ?)");
                                    $insSpec->bind_param("iss", $existingId, $row['facultad'], $row['programa_id']);
                                    $insSpec->execute();
                            }
                            } else if($row['tipo'] === 'docente') {
                                $chkSpec = $conn->prepare("SELECT id FROM docentes WHERE usuario_id = ? LIMIT 1");
                                $chkSpec->bind_param("i", $existingId);
                                $chkSpec->execute();
                                $rSpec = $chkSpec->get_result();
                                if($rSpec->num_rows === 0) {
                                    $insSpec = $conn->prepare("INSERT INTO docentes (usuario_id, facultad, programa_id) VALUES (?, ?, ?)");
                                    $insSpec->bind_param("iss", $existingId, $row['facultad'], $row['programa_id']);
                                    $insSpec->execute();
                                }
                            } else if($row['tipo'] === 'admin') {
                            $chkSpec = $conn->prepare("SELECT id FROM administradores WHERE usuario_id = ? LIMIT 1");
                            $chkSpec->bind_param("i", $existingId);
                            $chkSpec->execute();
                            $rSpec = $chkSpec->get_result();
                            if($rSpec->num_rows === 0) {
                                $insSpec = $conn->prepare("INSERT INTO administradores (usuario_id) VALUES (?)");
                                $insSpec->bind_param("i", $existingId);
                                $insSpec->execute();
                            }
                        }

                        // Marcar como aprobado
                        $upd = $conn->prepare("UPDATE pendientes SET estado = 'aprobado' WHERE id = ?");
                        $upd->bind_param("i", $id);
                        $upd->execute();

                        $conn->commit();
                        echo json_encode(["message" => "Registro aprobado (reutilizado usuario existente)", "usuario_id" => $existingId]);
                        break;
                    } else {
                        $conn->rollback();
                        http_response_code(409);
                        echo json_encode(["error" => "Ya existe un usuario con la misma identificación o email"]);
                        break;
                    }
                }

                // Insertar en usuarios con password_hash existente
                $sql = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, facultad, programa_id, password_hash, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
                $ins = $conn->prepare($sql);
                $ins->bind_param("sssssssssss",
                    $row['tipo'],
                    $row['identificacion'],
                    $row['nombres'],
                    $row['apellidos'],
                    $row['email'],
                    $row['telefono'],
                    $row['fecha_nacimiento'],
                    $row['direccion'],
                    $row['facultad'],
                    $row['programa_id'],
                    $row['password_hash']
                );

                if(!$ins->execute()) {
                    $conn->rollback();
                    http_response_code(500);
                    echo json_encode(["error" => "Error al insertar usuario: " . $ins->error]);
                    break;
                }

                $newUserId = $conn->insert_id;

                // Insertar en la tabla específica según el tipo
                if($row['tipo'] === 'estudiante') {
                    $stmt2 = $conn->prepare("INSERT INTO estudiantes (usuario_id, facultad, programa_id) VALUES (?, ?, ?)");
                    $stmt2->bind_param("iss", $newUserId, $row['facultad'], $row['programa_id']);
                    $stmt2->execute();
                } else if($row['tipo'] === 'docente') {
                    $codigo_docente = 'DOC-' . $newUserId;
                    $fecha_vinculacion = date('Y-m-d');
                    $facultad = (isset($row['facultad']) && is_numeric($row['facultad'])) ? intval($row['facultad']) : null;
                    $programa_id = (isset($row['programa_id']) && is_numeric($row['programa_id'])) ? intval($row['programa_id']) : null;
                    $stmt2 = $conn->prepare("INSERT INTO docentes (usuario_id, facultad, programa_id, codigo_docente, fecha_vinculacion) VALUES (?, ?, ?, ?, ?)");
                    $stmt2->bind_param("iisss", $newUserId, $facultad, $programa_id, $codigo_docente, $fecha_vinculacion);
                    $stmt2->execute();
                } else if($row['tipo'] === 'admin') {
                    $stmt2 = $conn->prepare("INSERT INTO administradores (usuario_id) VALUES (?)");
                    $stmt2->bind_param("i", $newUserId);
                    $stmt2->execute();
                }

                // Marcar como aprobado
                $upd = $conn->prepare("UPDATE pendientes SET estado = 'aprobado' WHERE id = ?");
                $upd->bind_param("i", $id);
                $upd->execute();

                $conn->commit();
                echo json_encode(["message" => "Registro aprobado", "usuario_id" => $newUserId]);
            } catch (Exception $e) {
                $conn->rollback();
                http_response_code(500);
                echo json_encode(["error" => "Excepción al procesar: " . $e->getMessage()]);
            }
        } else if($action === 'reject') {
            $stmt = $conn->prepare("UPDATE pendientes SET estado = 'rechazado' WHERE id = ? AND estado = 'pendiente'");
            $stmt->bind_param("i", $id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Registro rechazado"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al rechazar registro"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Acción desconocida"]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
