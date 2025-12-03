<?php
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
            $this->conn->set_charset("utf8mb4");
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
            exit();
        }
        return $this->conn;
    }

    public function getPDOConnection() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
            $pdo = new PDO($dsn, $this->user, $this->password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "PDO Connection failed: " . $e->getMessage()]);
            exit();
        }
    }
}

$database = new Database();
$conn = $database->getConnection();
$pdo = $database->getPDOConnection();
?>