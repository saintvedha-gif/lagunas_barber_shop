<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: index.php"); exit(); }
require_once "../config/conexion.php";

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$msg   = '';
$error = '';

// ── CREAR ─────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'crear') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $nombre  = trim($_POST['nombre']  ?? '');
    $seccion = $_POST['seccion'] ?? '';

    if ($nombre === '' || !in_array($seccion, ['ropa', 'cosmetico'])) {
        $error = "Completa todos los campos.";
    } else {
        try {
            $db->prepare("INSERT INTO categorias (nombre, seccion, activa) VALUES (?, ?, 1)")
               ->execute([$nombre, $seccion]);
            $msg = "✅ Categoría <strong>" . htmlspecialchars($nombre) . "</strong> creada.";
        } catch (PDOException $e) {
            $error = "Esa categoría ya existe en esa sección.";
        }
    }
}

// ── ELIMINAR ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'eliminar') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $id = (int)($_POST['id'] ?? 0);
    if ($id > 0) {
        // Verificar si tiene productos asociados
        $stmtCheck = $db->prepare("SELECT COUNT(*) FROM productos WHERE id_categoria = ?");
        $stmtCheck->execute([$id]);
        $count = (int)$stmtCheck->fetchColumn();

        if ($count > 0) {
            $error = "No puedes eliminar esta categoría porque tiene <strong>$count producto(s)</strong> asignados. Reasígnalos primero.";
        } else {
            $db->prepare("DELETE FROM categorias WHERE id = ?")->execute([$id]);
            $msg = "🗑️ Categoría eliminada.";
        }
    }
}

// ── RENOMBRAR ─────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'renombrar') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $id     = (int)($_POST['id']     ?? 0);
    $nombre = trim($_POST['nombre']  ?? '');

    if ($id > 0 && $nombre !== '') {
        try {
            $db->prepare("UPDATE categorias SET nombre = ? WHERE id = ?")->execute([$nombre, $id]);
            $msg = "✅ Categoría renombrada a <strong>" . htmlspecialchars($nombre) . "</strong>.";
        } catch (PDOException $e) {
            $error = "Ya existe una categoría con ese nombre en esta sección.";
        }
    }
}

// ── CARGAR TODAS ──────────────────────────────────────────────
$cats = $db->query(
    "SELECT c.*, COUNT(p.id) AS total_productos
     FROM categorias c
     LEFT JOIN productos p ON p.id_categoria = c.id
     GROUP BY c.id
     ORDER BY c.seccion, c.nombre"
)->fetchAll();

$catsRopa = array_filter($cats, fn($c) => $c['seccion'] === 'ropa');
$catsCos  = array_filter($cats, fn($c) => $c['seccion'] === 'cosmetico');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categorías | Laguna's Admin</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="container py-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold">🏷️ Gestión de Categorías</h2>
            <p class="text-secondary mb-0">Crea, renombra o elimina categorías del shop.</p>
        </div>
        <a href="panel.php" class="btn btn-outline-light">← Volver al Panel</a>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <?= $msg ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <?= $error ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">

        <!-- ── FORMULARIO NUEVA CATEGORÍA ── -->
        <div class="col-lg-4">
            <div class="card bg-dark border-info p-4">
                <h5 class="fw-bold text-info mb-3"><i class="bi bi-plus-circle me-2"></i>Nueva Categoría</h5>
                <form method="POST">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <input type="hidden" name="accion" value="crear">

                    <div class="mb-3">
                        <label class="form-label small fw-bold">Nombre *</label>
                        <input type="text" name="nombre"
                               class="form-control bg-black text-white border-secondary"
                               placeholder="Ej: Gorras, Zapatos, Ceras..."
                               maxlength="80" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-bold">Sección *</label>
                        <select name="seccion" class="form-select bg-black text-white border-secondary" required>
                            <option value="" disabled selected>-- Selecciona --</option>
                            <option value="ropa">👕 Ropa y Calzado</option>
                            <option value="cosmetico">💧 Cosméticos</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-info w-100 fw-bold">
                        <i class="bi bi-plus-lg me-1"></i>Crear Categoría
                    </button>
                </form>
            </div>
        </div>

        <!-- ── LISTA DE CATEGORÍAS ── -->
        <div class="col-lg-8">

            <!-- Ropa -->
            <div class="mb-4">
                <h5 class="fw-bold mb-3">
                    <i class="bi bi-tag-fill me-2 text-info"></i>Ropa y Calzado
                    <span class="badge bg-secondary ms-1"><?= count($catsRopa) ?></span>
                </h5>
                <?php if (empty($catsRopa)): ?>
                    <p class="text-secondary small">No hay categorías aún.</p>
                <?php else: ?>
                <div class="table-responsive">
                <table class="table table-dark table-hover align-middle">
                    <thead><tr>
                        <th>Nombre</th>
                        <th class="text-center">Productos</th>
                        <th>Acciones</th>
                    </tr></thead>
                    <tbody>
                    <?php foreach ($catsRopa as $cat): ?>
                    <tr>
                        <td class="fw-bold"><?= htmlspecialchars($cat['nombre']) ?></td>
                        <td class="text-center">
                            <span class="badge <?= $cat['total_productos'] > 0 ? 'bg-success' : 'bg-secondary' ?>">
                                <?= $cat['total_productos'] ?> producto(s)
                            </span>
                        </td>
                        <td>
                            <div class="d-flex gap-2">
                                <!-- Botón renombrar -->
                                <button class="btn btn-sm btn-warning"
                                        onclick="abrirRenombrar(<?= $cat['id'] ?>, '<?= htmlspecialchars($cat['nombre'], ENT_QUOTES) ?>')">
                                    <i class="bi bi-pencil"></i> Renombrar
                                </button>
                                <!-- Botón eliminar -->
                                <form method="POST" onsubmit="return confirm('¿Eliminar la categoría \'<?= htmlspecialchars($cat['nombre'], ENT_QUOTES) ?>\'?')">
                                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                    <input type="hidden" name="accion" value="eliminar">
                                    <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                                    <button type="submit" class="btn btn-sm btn-danger">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                </div>
                <?php endif; ?>
            </div>

            <!-- Cosméticos -->
            <div>
                <h5 class="fw-bold mb-3">
                    <i class="bi bi-droplet-fill me-2 text-info"></i>Cosméticos
                    <span class="badge bg-secondary ms-1"><?= count($catsCos) ?></span>
                </h5>
                <?php if (empty($catsCos)): ?>
                    <p class="text-secondary small">No hay categorías aún.</p>
                <?php else: ?>
                <div class="table-responsive">
                <table class="table table-dark table-hover align-middle">
                    <thead><tr>
                        <th>Nombre</th>
                        <th class="text-center">Productos</th>
                        <th>Acciones</th>
                    </tr></thead>
                    <tbody>
                    <?php foreach ($catsCos as $cat): ?>
                    <tr>
                        <td class="fw-bold"><?= htmlspecialchars($cat['nombre']) ?></td>
                        <td class="text-center">
                            <span class="badge <?= $cat['total_productos'] > 0 ? 'bg-success' : 'bg-secondary' ?>">
                                <?= $cat['total_productos'] ?> producto(s)
                            </span>
                        </td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-warning"
                                        onclick="abrirRenombrar(<?= $cat['id'] ?>, '<?= htmlspecialchars($cat['nombre'], ENT_QUOTES) ?>')">
                                    <i class="bi bi-pencil"></i> Renombrar
                                </button>
                                <form method="POST" onsubmit="return confirm('¿Eliminar la categoría \'<?= htmlspecialchars($cat['nombre'], ENT_QUOTES) ?>\'?')">
                                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                    <input type="hidden" name="accion" value="eliminar">
                                    <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                                    <button type="submit" class="btn btn-sm btn-danger">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<!-- Modal Renombrar -->
<div class="modal fade" id="modalRenombrar" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold">✏️ Renombrar Categoría</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <input type="hidden" name="accion" value="renombrar">
                <input type="hidden" name="id" id="renombrar-id">
                <div class="modal-body">
                    <label class="form-label fw-bold">Nuevo nombre</label>
                    <input type="text" name="nombre" id="renombrar-nombre"
                           class="form-control bg-black text-white border-secondary"
                           maxlength="80" required>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning fw-bold">Guardar nombre</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
<script>
function abrirRenombrar(id, nombreActual) {
    document.getElementById('renombrar-id').value = id;
    document.getElementById('renombrar-nombre').value = nombreActual;
    new bootstrap.Modal(document.getElementById('modalRenombrar')).show();
}
</script>
</body>
</html>
