<?php
// ============================================
// config.php - Configuración de Base de Datos
// ============================================

// Prevenir acceso directo
if (!defined('APP_ACCESS')) {
    die('Acceso directo no permitido');
}

// ============================================
// DETECTAR ENTORNO
// ============================================

$is_local = (
    $_SERVER['SERVER_NAME'] == 'localhost' || 
    $_SERVER['SERVER_NAME'] == '127.0.0.1' ||
    strpos($_SERVER['SERVER_NAME'], '.local') !== false
);

// ============================================
// CONFIGURACIÓN LOCAL (XAMPP)
// ============================================
if ($is_local) {
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'cotizaciones_mantenimiento');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_CHARSET', 'utf8mb4');
    
    define('DEBUG_MODE', true);
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
// ============================================
// CONFIGURACIÓN PRODUCCIÓN
// ============================================
else {
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_NAME', getenv('DB_NAME') ?: 'cotizaciones_mantenimiento');
    define('DB_USER', getenv('DB_USER') ?: 'root');
    define('DB_PASS', getenv('DB_PASS') ?: '');
    define('DB_CHARSET', 'utf8mb4');
    
    define('DEBUG_MODE', false);
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================
define('APP_NAME', 'Sistema de Cotización');
define('APP_VERSION', '2.0.0');

date_default_timezone_set('America/Santo_Domingo');

// ============================================
// CLASE DE CONEXIÓN
// ============================================
class Database {
    private static $instance = null;
    private $conn;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            if (DEBUG_MODE) {
                error_log("✅ Conexión a MySQL exitosa");
            }
            
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                die(json_encode([
                    'success' => false,
                    'error' => 'Error de conexión a MySQL: ' . $e->getMessage()
                ]));
            } else {
                die(json_encode([
                    'success' => false,
                    'error' => 'Error de conexión a la base de datos'
                ]));
            }
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    private function __clone() {}
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getDB() {
    return Database::getInstance()->getConnection();
}

function cleanInput($data) {
    if (is_null($data)) return null;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function generarNumeroFolio() {
    $fecha = new DateTime();
    $año = $fecha->format('Y');
    $mes = $fecha->format('m');
    $dia = $fecha->format('d');
    $hora = $fecha->format('His');
    $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
    
    return "COT-{$año}{$mes}{$dia}-{$hora}-{$random}";
}

// ============================================
// HEADERS DE SEGURIDAD Y CORS
// ============================================
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");

if ($is_local) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

?>