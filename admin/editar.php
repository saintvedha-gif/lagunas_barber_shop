<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: index.php"); exit(); }
require_once "../config/conexion.php";

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) { header("Location: panel.php"); exit(); }

// ── Eliminar imagen individual ────────────────────────────────
if (isset($_GET['eliminar_img'])) {
    $imgNombre = basename($_GET['eliminar_img']);
    $db->prepare("DELETE FROM producto_imagenes WHERE id_producto = ? AND nombre_archivo = ?")->execute([$id, $imgNombre]);
    $ruta = "../img/" . $imgNombre;
    if (file_exists($ruta) && !empty($imgNombre)) unlink($ruta);
    // Si queda alguna, promover la primera como portada
    $db->prepare("UPDATE producto_imagenes SET es_portada = 0 WHERE id_producto = ?")->execute([$id]);
    $db->prepare("UPDATE producto_imagenes SET es_portada = 1 WHERE id_producto = ? ORDER BY orden ASC LIMIT 1")->execute([$id]);
    header("Location: editar.php?id=$id"); exit();
}

// ── Actualizar color de imagen existente (AJAX) ───────────────
if (isset($_POST['accion']) && $_POST['accion'] === 'actualizar_color_img') {
    $idImg  = (int)($_POST['id_img'] ?? 0);
    $color  = trim($_POST['color'] ?? '');
    $db->prepare("UPDATE producto_imagenes SET color = ? WHERE id = ? AND id_producto = ?")
       ->execute([$color ?: null, $idImg, $id]);
    echo json_encode(['ok' => true]);
    exit();
}

// ── Obtener producto ──────────────────────────────────────────
$stmt = $db->prepare("SELECT * FROM productos WHERE id = ? LIMIT 1");
$stmt->execute([$id]);
$producto = $stmt->fetch();
if (!$producto) { header("Location: panel.php"); exit(); }

// ── Obtener imágenes ──────────────────────────────────────────
$stmtImgs = $db->prepare("SELECT * FROM producto_imagenes WHERE id_producto = ? ORDER BY es_portada DESC, orden ASC");
$stmtImgs->execute([$id]);
$imagenesActuales = $stmtImgs->fetchAll();

// ── Subida de imágenes ────────────────────────────────────────
define('IMG_EXTENSIONES', ['jpg','jpeg','png','webp','gif']);
define('IMG_MAX_BYTES',   5 * 1024 * 1024);

function subirImagen(array $file, string $destDir): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK) return null;
    if ($file['size']  >  IMG_MAX_BYTES)  return null;
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, IMG_EXTENSIONES)) return null;
    if (@getimagesize($file['tmp_name']) === false) return null;
    $nombreFinal = time() . "_" . uniqid() . "." . $ext;
    return move_uploaded_file($file['tmp_name'], $destDir . $nombreFinal) ? $nombreFinal : null;
}

// ── Procesar formulario ───────────────────────────────────────
$error = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['accion'])) {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $nombre          = trim($_POST['nombre']          ?? '');
    $seccion         = $_POST['seccion']              ?? '';
    $id_categoria    = (int)($_POST['id_categoria']   ?? 0);
    $precio          = (float)($_POST['precio']       ?? 0);
    $precio_anterior = !empty($_POST['precio_anterior']) ? (float)$_POST['precio_anterior'] : null;
    $en_oferta       = ($_POST['en_oferta'] ?? '0') == '1' ? 1 : 0;
    $stock           = max(0, (int)($_POST['stock']   ?? 0));
    $tallas          = trim($_POST['tallas']          ?? '');
    $colores         = trim($_POST['colores']         ?? '');
    $descripcion     = trim($_POST['descripcion']     ?? '');

    if ($nombre === '' || !in_array($seccion, ['ropa','cosmetico']) || $precio <= 0) {
        $error = "Completa los campos obligatorios.";
    } else {
        $db->prepare(
            "UPDATE productos SET nombre=?,seccion=?,id_categoria=?,precio=?,precio_anterior=?,
             en_oferta=?,stock=?,tallas=?,colores=?,descripcion=? WHERE id=?"
        )->execute([$nombre,$seccion,$id_categoria?:null,$precio,$precio_anterior,
                    $en_oferta,$stock,$tallas,$colores,$descripcion,$id]);

        // Subir nuevas imágenes con color
        if (!empty($_FILES['imagenes_nuevas']['name'])) {
            $hayPortada = count($imagenesActuales) > 0;
            $stmtImg = $db->prepare(
                "INSERT INTO producto_imagenes (id_producto, nombre_archivo, color, es_portada, orden) VALUES (?,?,?,?,?)"
            );
            foreach ($_FILES['imagenes_nuevas']['name'] as $idx => $nombreOrig) {
                $fileItem = [
                    'name'     => $_FILES['imagenes_nuevas']['name'][$idx],
                    'tmp_name' => $_FILES['imagenes_nuevas']['tmp_name'][$idx],
                    'error'    => $_FILES['imagenes_nuevas']['error'][$idx],
                    'size'     => $_FILES['imagenes_nuevas']['size'][$idx],
                ];
                $colorImg = trim($_POST['color_nueva_img'][$idx] ?? '');
                $guardado = subirImagen($fileItem, "../img/");
                if ($guardado) {
                    $esPortada = (!$hayPortada) ? 1 : 0;
                    $hayPortada = true;
                    $stmtImg->execute([$id, $guardado, $colorImg ?: null, $esPortada,
                                       count($imagenesActuales) + $idx]);
                }
            }
        }

        header("Location: panel.php?ok=editado"); exit();
    }
}

$categorias = $db->query("SELECT * FROM categorias ORDER BY seccion, nombre")->fetchAll();
if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Colores existentes para sugerencias
$coloresExistentes = array_column(
    $db->query("SELECT DISTINCT color FROM producto_imagenes WHERE color IS NOT NULL AND color != ''")->fetchAll(),
    'color'
);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Producto | Laguna's Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="container py-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">✏️ EDITAR PRODUCTO</h2>
        <a href="panel.php" class="btn btn-outline-light btn-sm">← Volver al Panel</a>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data" class="bg-black p-4 rounded border border-secondary">
        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

        <div class="row">
            <!-- Datos básicos -->
            <div class="col-md-7">
                <div class="mb-3">
                    <label class="form-label fw-bold">Nombre *</label>
                    <input type="text" name="nombre" class="form-control bg-dark text-white border-secondary"
                           value="<?= htmlspecialchars($producto['nombre']) ?>" required maxlength="150">
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold text-warning">Sección *</label>
                        <select name="seccion" class="form-select bg-dark text-white border-warning" required>
                            <option value="ropa"      <?= $producto['seccion']=='ropa'      ?'selected':'' ?>>Ropa y Calzado</option>
                            <option value="cosmetico" <?= $producto['seccion']=='cosmetico' ?'selected':'' ?>>Cosméticos</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Categoría</label>
                        <select name="id_categoria" class="form-select bg-dark text-white border-secondary">
                            <option value="">-- Sin categoría --</option>
                            <?php foreach ($categorias as $cat): ?>
                                <option value="<?= $cat['id'] ?>" <?= $producto['id_categoria']==$cat['id'] ?'selected':'' ?>>
                                    <?= htmlspecialchars($cat['nombre']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Precio (COP) *</label>
                        <input type="number" name="precio" class="form-control bg-dark text-white border-secondary"
                               value="<?= $producto['precio'] ?>" min="0" step="100" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Precio Anterior</label>
                        <input type="number" name="precio_anterior" class="form-control bg-dark text-white border-secondary"
                               value="<?= $producto['precio_anterior'] ?>" min="0" step="100">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Stock</label>
                        <input type="number" name="stock" class="form-control bg-dark text-white border-secondary"
                               value="<?= $producto['stock'] ?>" min="0" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">¿En oferta?</label>
                        <select name="en_oferta" class="form-select bg-dark text-white border-secondary">
                            <option value="0" <?= $producto['en_oferta']==0 ?'selected':'' ?>>No</option>
                            <option value="1" <?= $producto['en_oferta']==1 ?'selected':'' ?>>Sí</option>
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold text-info">
                        Colores del producto
                        <small class="text-secondary fw-normal">(separados por coma)</small>
                    </label>
                    <input type="text" name="colores" class="form-control bg-dark text-white border-info"
                           value="<?= htmlspecialchars($producto['colores'] ?? '') ?>"
                           placeholder="negro, blanco, rojo" maxlength="200">
                    <small class="text-secondary">Estos son los colores que verá el cliente en la tienda.</small>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold text-info">Tallas</label>
                    <input type="text" name="tallas" class="form-control bg-dark text-white border-info"
                           value="<?= htmlspecialchars($producto['tallas'] ?? '') ?>"
                           placeholder="S, M, L, XL" maxlength="100">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Descripción</label>
                    <textarea name="descripcion" class="form-control bg-dark text-white border-secondary"
                              rows="2" maxlength="1000"><?= htmlspecialchars($producto['descripcion'] ?? '') ?></textarea>
                </div>
            </div>

            <!-- Imágenes -->
            <div class="col-md-5">

                <!-- Imágenes actuales con su color -->
                <div class="card bg-dark border-info p-3 mb-3">
                    <label class="form-label fw-bold text-info mb-3">
                        <i class="bi bi-images me-1"></i> Imágenes actuales
                        <small class="text-secondary fw-normal d-block mt-1">
                            Haz clic en el color para editarlo. La primera es la portada.
                        </small>
                    </label>

                    <div class="d-flex flex-wrap">
                        <?php foreach ($imagenesActuales as $imgRow): ?>
                            <div class="img-wrapper" id="wrapper-img-<?= $imgRow['id'] ?>">
                                <div style="position:relative; display:inline-block;">
                                    <img src="../img/<?= htmlspecialchars($imgRow['nombre_archivo']) ?>"
                                         class="thumb-edit"
                                         onerror="this.src='../img/no-image.png'">
                                    <?php if ($imgRow['es_portada']): ?>
                                        <span class="badge bg-info text-dark position-absolute" style="top:2px;left:2px;font-size:0.55rem;">PORTADA</span>
                                    <?php endif; ?>
                                    <button type="button" class="btn-delete-img position-absolute"
                                            style="top:-6px;right:-6px;"
                                            onclick="confirmarEliminarImg('<?= htmlspecialchars($imgRow['nombre_archivo']) ?>')">✕</button>
                                </div>

                                <!-- Etiqueta de color editable -->
                                <span class="color-badge-img" id="badge-color-<?= $imgRow['id'] ?>"
                                      onclick="editarColorImg(<?= $imgRow['id'] ?>, this)"
                                      title="Clic para cambiar el color de esta imagen">
                                    <?= $imgRow['color'] ? htmlspecialchars($imgRow['color']) : '+ color' ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                        <?php if (empty($imagenesActuales)): ?>
                            <p class="small text-muted">Sin imágenes aún.</p>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Agregar nuevas imágenes -->
                <div class="card bg-dark border-secondary p-3">
                    <label class="form-label fw-bold mb-3">
                        <i class="bi bi-plus-circle me-1"></i> Agregar más imágenes
                    </label>
                    <div id="zonaImagenesNuevas"></div>
                    <button type="button" class="btn btn-outline-info btn-sm w-100 mt-2" onclick="agregarFilaNueva()">
                        <i class="bi bi-plus me-1"></i> Añadir imagen
                    </button>
                </div>
            </div>
        </div>

        <hr class="border-secondary my-4">
        <button type="submit" class="btn btn-success w-100 fw-bold py-3">
            <i class="bi bi-check-circle-fill me-2"></i>GUARDAR CAMBIOS
        </button>
    </form>
</div>

<script>
    // ── Eliminar imagen ───────────────────────────────────────
    function confirmarEliminarImg(nombre) {
        if (confirm('¿Eliminar esta imagen?')) {
            window.location.href = 'editar.php?id=<?= $id ?>&eliminar_img=' + encodeURIComponent(nombre);
        }
    }

    // ── Editar color de imagen existente ─────────────────────
    function editarColorImg(idImg, badge) {
        const colorActual = badge.textContent.trim() === '+ color' ? '' : badge.textContent.trim();
        const sugerencias = <?= json_encode($coloresExistentes) ?>;

        const nuevoColor = prompt(
            'Color para esta imagen:\n(ej: negro, blanco, rojo, #ff0033)\n\nColores usados: ' + sugerencias.join(', '),
            colorActual
        );

        if (nuevoColor === null) return; // Canceló

        // Guardar vía fetch
        fetch('editar.php?id=<?= $id ?>', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                accion:    'actualizar_color_img',
                id_img:    idImg,
                color:     nuevoColor.trim(),
                csrf_token: '<?= $_SESSION['csrf_token'] ?>'
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                badge.textContent = nuevoColor.trim() || '+ color';
            }
        });
    }

    // ── Nuevas imágenes con color ─────────────────────────────
    let contadorNuevas = 0;

    function agregarFilaNueva() {
        const zona = document.getElementById('zonaImagenesNuevas');
        const idx  = contadorNuevas++;
        const div  = document.createElement('div');
        div.className = 'border border-secondary rounded p-2 mb-2';
        div.id = `nueva-fila-${idx}`;
        div.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-2">
                <label class="small fw-bold mb-0">Imagen ${idx + 1}</label>
                <button type="button" class="btn btn-outline-danger btn-sm ms-auto px-2 py-0"
                        onclick="document.getElementById('nueva-fila-${idx}').remove()">✕</button>
            </div>
            <input type="file" name="imagenes_nuevas[]" accept="image/*"
                   class="form-control form-control-sm bg-dark text-white border-secondary mb-2"
                   onchange="previsualizarNueva(this, ${idx})">
            <div id="prev-nueva-${idx}" class="mb-2" style="display:none;">
                <img style="width:70px;height:70px;object-fit:cover;border-radius:6px;">
            </div>
            <div class="input-group input-group-sm">
                <span class="input-group-text bg-dark text-info border-info small">Color</span>
                <input type="text" name="color_nueva_img[]"
                       class="form-control bg-dark text-white border-info"
                       placeholder="negro, blanco..." maxlength="60"
                       list="lista-colores-datalist">
            </div>`;
        zona.appendChild(div);
    }

    function previsualizarNueva(input, idx) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                const prev = document.getElementById(`prev-nueva-${idx}`);
                prev.style.display = 'block';
                prev.querySelector('img').src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Datalist de sugerencias de color
    const dl = document.createElement('datalist');
    dl.id = 'lista-colores-datalist';
    <?php foreach ($coloresExistentes as $c): ?>
    dl.innerHTML += `<option value="<?= htmlspecialchars($c) ?>">`;
    <?php endforeach; ?>
    document.body.appendChild(dl);
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
