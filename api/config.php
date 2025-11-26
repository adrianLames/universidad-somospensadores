<?php
// PRIMERO incluir CORS para establecer headers
include_once __DIR__ . '/cors.php';

// LUEGO establecer Content-Type
header("Content-Type: application/json; charset=UTF-8", true);

// Configuración de la base de datos y conexión
class Database {
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $database = "universidad_somospensadores";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new mysqli($this->host, $this->user, $this->password, $this->database);
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            $this->conn->set_charset("utf8");
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}

$database = new Database();
$conn = $database->getConnection();
?>