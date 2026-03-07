<?php
/**
 * ELIMINAR PRODUCTO — Versión Segura con PDO
 * - Verifica sesión admin
 * - Usa prepared statements (no SQL injection)
 * - Borra imágenes físicas del servidor
 */
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit();
}

require_once "../config/conexion.php";

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id > 0) {
    // Obtener imágenes del producto antes de borrar
    $stmt = $db->prepare("SELECT nombre_archivo FROM producto_imagenes WHERE id_producto = ?");
    $stmt->execute([$id]);
    $imagenes = $stmt->fetchAll();

    // Borrar archivos físicos
    foreach ($imagenes as $img) {
        $ruta = "../img/" . $img['nombre_archivo'];
        if (file_exists($ruta) && !empty($img['nombre_archivo'])) {
            unlink($ruta);
        }
    }

    // Borrar producto (las imágenes en BD se borran por CASCADE)
    $db->prepare("DELETE FROM productos WHERE id = ?")->execute([$id]);
}

header("Location: panel.php?ok=eliminado");
exit();
