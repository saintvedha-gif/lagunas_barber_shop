<?php
/**
 * Laguna's Barber & Shop — Conexión Segura
 * Usa PDO con prepared statements.
 * Nunca uses mysqli_query con variables directo — usa esta conexión.
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');   // XAMPP por defecto usa 3306 (ajusta si usas otro puerto)
define('DB_NAME', 'laguna_shop');
define('DB_USER', 'root');
define('DB_PASS', '');       // En producción pon una contraseña fuerte aquí

function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST
                 . ";port="     . DB_PORT
                 . ";dbname="   . DB_NAME
                 . ";charset=utf8mb4";

            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Prepared statements reales
            ]);

        } catch (PDOException $e) {
            // En producción NUNCA mostrar el error real al cliente
            error_log("DB Error: " . $e->getMessage());
            die("Error de conexión. Intenta más tarde.");
        }
    }

    return $pdo;
}

// Variable global de compatibilidad (para código legacy que use $conn)
// Se mantendrá mientras se migra el código antiguo.
$db = getDB();
