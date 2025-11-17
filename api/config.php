<?php
include_once __DIR__ . '/cors.php';
// Configuración de la base de datos y conexión
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

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