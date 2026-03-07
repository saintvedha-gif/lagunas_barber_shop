<?php

/**
 * PANEL DE ADMINISTRACIÓN — Versión Segura con PDO
 */
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit();
}

require_once "../config/conexion.php";

$stmtRopa = $db->prepare(
    "SELECT * FROM v_productos_portada WHERE seccion = 'ropa' ORDER BY id DESC"
);
$stmtRopa->execute();
$productosRopa = $stmtRopa->fetchAll();

$stmtCos = $db->prepare(
    "SELECT * FROM v_productos_portada WHERE seccion = 'cosmetico' ORDER BY id DESC"
);
$stmtCos->execute();
$productosCosmeticos = $stmtCos->fetchAll();

$okMsg = match ($_GET['ok'] ?? '') {
    'agregado'  => '✅ Producto agregado correctamente.',
    'editado'   => '✅ Producto actualizado correctamente.',
    'eliminado' => '🗑️ Producto eliminado.',
    default     => ''
};
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin | Laguna's Shop</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>

<body>
    <div class="container py-5">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold">Panel de Administración</h2>
                <p class="text-secondary mb-0">Bienvenido <?= htmlspecialchars($_SESSION['admin_nombre']) ?> 🔥</p>
            </div>
            <div>
                <a href="agregar.php" class="btn btn-success me-2">➕ Agregar Producto</a>
                <a href="categorias.php" class="btn btn-outline-info me-2"><i class="bi bi-tags-fill me-1"></i>Categorías</a>
                <a href="barberia.php" class="btn btn-outline-warning me-2"><i class="bi bi-scissors me-1"></i>Barbería</a>
                <a href="cambiar_password.php" class="btn btn-outline-secondary me-2"><i class="bi bi-person-gear me-1"></i>Mi Cuenta</a>
                <a href="logout.php" class="btn btn-outline-light">Cerrar sesión</a>
            </div>
        </div>

        <?php if ($okMsg): ?>
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <?= htmlspecialchars($okMsg) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <!-- Tabs: Ropa | Cosméticos | Barbería (redirige a barberia.php) -->
        <ul class="nav nav-tabs mb-4 border-secondary" id="adminTab" role="tablist">
            <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#ropa" type="button">
                    <i class="bi bi-tag-fill me-2"></i>ROPA Y CALZADO
                    <span class="badge bg-secondary ms-1"><?= count($productosRopa) ?></span>
                </button>
            </li>
            <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#cosmeticos" type="button">
                    <i class="bi bi-droplet-fill me-2"></i>COSMÉTICOS
                    <span class="badge bg-secondary ms-1"><?= count($productosCosmeticos) ?></span>
                </button>
            </li>
        </ul>

        <div class="tab-content">
            <div class="tab-pane fade show active" id="ropa">
                <?php renderTabla($productosRopa); ?>
            </div>
            <div class="tab-pane fade" id="cosmeticos">
                <?php renderTabla($productosCosmeticos); ?>
            </div>
        </div>

    </div>

    <?php
    function renderTabla(array $productos): void
    {
        if (empty($productos)): ?>
            <div class="text-center py-5 border border-secondary rounded">
                <p class="text-secondary">No hay productos en esta sección.</p>
            </div>
        <?php return;
        endif; ?>

        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Oferta</th>
                        <th>Categoría</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($productos as $i => $row):
                        $img = $row['imagen_portada'] ?? 'no-image.png';
                    ?>
                        <tr>
                            <td class="text-secondary"><?= $i + 1 ?></td>
                            <td><img src="../img/<?= htmlspecialchars($img) ?>" class="img-mini" onerror="this.src='../img/no-image.png'"></td>
                            <td class="fw-bold"><?= htmlspecialchars($row['nombre']) ?></td>
                            <td>$<?= number_format($row['precio'], 0, ',', '.') ?></td>
                            <td>
                                <?php if ($row['en_oferta']): ?>
                                    <span class="badge badge-oferta">OFERTA</span><br>
                                    <small class="text-danger fw-bold">$<?= number_format($row['precio_anterior'], 0, ',', '.') ?></small>
                                <?php else: ?>
                                    <span class="badge bg-secondary opacity-50">Normal</span>
                                <?php endif; ?>
                            </td>
                            <td><span class="badge border border-info text-info text-uppercase"><?= htmlspecialchars($row['categoria'] ?? '-') ?></span></td>
                            <td>
                                <?php if ($row['stock'] > 0): ?>
                                    <span class="badge bg-success"><?= $row['stock'] ?> und</span>
                                <?php else: ?>
                                    <span class="badge bg-danger">Agotado</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div class="btn-group">
                                    <a href="editar.php?id=<?= $row['id'] ?>" class="btn btn-sm btn-warning">Editar</a>
                                    <a href="eliminar.php?id=<?= $row['id'] ?>"
                                        onclick="return confirm('¿Eliminar este producto?')"
                                        class="btn btn-sm btn-danger">Borrar</a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php } ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
</body>

</html>