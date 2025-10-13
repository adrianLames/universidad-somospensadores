<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    $password = $data['password'];

    $sql = "SELECT id, tipo, identificacion, nombres, apellidos, email, password_hash 
            FROM usuarios 
            WHERE email = ? AND activo = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password_hash'])) {
            // Eliminar el password del objeto de respuesta
            unset($user['password_hash']);
            echo json_encode($user);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Credenciales incorrectas"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>