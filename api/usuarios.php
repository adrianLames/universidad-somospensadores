<?php
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
        $curso_id = isset($_GET['curso_id']) ? $_GET['curso_id'] : '';
        
        if($tipo) {
            $sql = "SELECT * FROM usuarios WHERE tipo = ? AND activo = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $tipo);
            $stmt->execute();
            $result = $stmt->get_result();
        } else if($curso_id) {
            $sql = "SELECT u.* FROM usuarios u 
                    INNER JOIN matriculas m ON u.id = m.estudiante_id 
                    WHERE m.curso_id = ? AND u.activo = 1 AND u.tipo = 'estudiante'";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $curso_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT * FROM usuarios WHERE activo = 1";
            $result = $conn->query($sql);
        }
        
        $usuarios = [];
        while($row = $result->fetch_assoc()) {
            unset($row['password_hash']); // No enviar el password
            $usuarios[] = $row;
        }
        echo json_encode($usuarios);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, telefono, fecha_nacimiento, direccion, password_hash) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssss", 
            $data['tipo'],
            $data['identificacion'],
            $data['nombres'],
            $data['apellidos'],
            $data['email'],
            $data['telefono'],
            $data['fecha_nacimiento'],
            $data['direccion'],
            $password_hash
        );
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Usuario creado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear usuario: " . $stmt->error]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'];
        
        if(isset($data['password']) && !empty($data['password'])) {
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=?, password_hash=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssssssi", 
                $data['tipo'],
                $data['identificacion'],
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['direccion'],
                $password_hash,
                $id
            );
        } else {
            $sql = "UPDATE usuarios SET tipo=?, identificacion=?, nombres=?, apellidos=?, email=?, telefono=?, fecha_nacimiento=?, direccion=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssssssi", 
                $data['tipo'],
                $data['identificacion'],
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['direccion'],
                $id
            );
        }
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Usuario actualizado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar usuario"]);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $sql = "UPDATE usuarios SET activo=0 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Usuario eliminado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar usuario"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>