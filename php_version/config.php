<?php
// config.php - Pengaturan Database
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Ganti dengan username database hosting Anda
define('DB_PASS', '');     // Ganti dengan password database hosting Anda
define('DB_NAME', 'konveksi_db');

function getDB() {
    try {
        $db = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ATTR_ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $db;
    } catch (PDOException $e) {
        die(json_encode(['error' => 'Koneksi database gagal: ' . $e->getMessage()]));
    }
}
?>
