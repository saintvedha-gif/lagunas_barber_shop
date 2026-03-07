<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: index.php"); exit(); }
require_once "../config/conexion.php";

$error = "";

define('IMG_EXTENSIONES', ['jpg','jpeg','png','webp','gif']);
define('IMG_MAX_BYTES', 5 * 1024 * 1024);

function subirImagen(array $file, string $destDir): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK) return null;
    if ($file['size']  >  IMG_MAX_BYTES)  return null;
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, IMG_EXTENSIONES)) return null;
    if (@getimagesize($file['tmp_name']) === false) return null;
    $nombreFinal = time() . "_" . uniqid() . "." . $ext;
    return move_uploaded_file($file['tmp_name'], $destDir . $nombreFinal) ? $nombreFinal : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        $error = "Completa los campos obligatorios correctamente.";
    } else {
        // Insertar producto
        $stmt = $db->prepare(
            "INSERT INTO productos (nombre,seccion,id_categoria,precio,precio_anterior,en_oferta,stock,tallas,colores,descripcion)
             VALUES (?,?,?,?,?,?,?,?,?,?)"
        );
        $stmt->execute([$nombre, $seccion, $id_categoria ?: null, $precio, $precio_anterior, $en_oferta, $stock, $tallas, $colores, $descripcion]);
        $idProducto = (int)$db->lastInsertId();

        /*
         * Nuevo sistema: cada "grupo" = un color con N imágenes.
         * Los inputs vienen como: imagenes_color_0[], imagenes_color_1[], ...
         * El color del grupo viene como: color_grupo_0, color_grupo_1, ...
         * No hay límite de grupos ni de imágenes por grupo.
         */
        $stmtImg = $db->prepare(
            "INSERT INTO producto_imagenes (id_producto, nombre_archivo, color, es_portada, orden) VALUES (?,?,?,?,?)"
        );

        $hayPortada = false;
        $ordenGlobal = 0;

        // Detectar todos los grupos enviados
        $grupoIdx = 0;
        while (isset($_FILES["imagenes_color_{$grupoIdx}"])) {
            $grupo     = $_FILES["imagenes_color_{$grupoIdx}"];
            $colorGrupo = trim($_POST["color_grupo_{$grupoIdx}"] ?? '');

            // Normalizar estructura de $_FILES para múltiples archivos
            $archivos = [];
            if (is_array($grupo['name'])) {
                foreach ($grupo['name'] as $i => $n) {
                    $archivos[] = [
                        'name'     => $n,
                        'tmp_name' => $grupo['tmp_name'][$i],
                        'error'    => $grupo['error'][$i],
                        'size'     => $grupo['size'][$i],
                    ];
                }
            } else {
                // Un solo archivo (no seleccionó múltiples)
                $archivos[] = $grupo;
            }

            foreach ($archivos as $fileItem) {
                $guardado = subirImagen($fileItem, "../img/");
                if ($guardado) {
                    $esPortada = (!$hayPortada) ? 1 : 0;
                    $hayPortada = true;
                    $stmtImg->execute([$idProducto, $guardado, $colorGrupo ?: null, $esPortada, $ordenGlobal++]);
                }
            }
            $grupoIdx++;
        }

        header("Location: panel.php?ok=agregado");
        exit();
    }
}

$categorias = $db->query("SELECT * FROM categorias ORDER BY seccion, nombre")->fetchAll();
if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Construir lista de colores únicos de todos los productos (para sugerencias)
$coloresExistentes = [];
$rows = $db->query("SELECT DISTINCT color FROM producto_imagenes WHERE color IS NOT NULL AND color != ''")->fetchAll();
foreach ($rows as $r) $coloresExistentes[] = $r['color'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Producto | Laguna's Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="container py-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">➕ NUEVO PRODUCTO</h2>
        <a href="panel.php" class="btn btn-outline-light btn-sm">← Volver al Panel</a>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data" class="bg-black p-4 rounded border border-secondary" id="formProducto">
        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

        <div class="row">
            <!-- COLUMNA IZQUIERDA: datos básicos -->
            <div class="col-md-7">
                <div class="mb-3">
                    <label class="form-label fw-bold">Nombre del Producto *</label>
                    <input type="text" name="nombre" class="form-control bg-dark text-white border-secondary"
                           placeholder="Ej: Camisa Oversize" required maxlength="150">
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold text-warning">Sección *</label>
                        <select name="seccion" class="form-select bg-dark text-white border-warning" required id="selectSeccion">
                            <option value="" disabled selected>-- Selecciona --</option>
                            <option value="ropa">Ropa y Calzado</option>
                            <option value="cosmetico">Cosméticos</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Categoría</label>
                        <select name="id_categoria" class="form-select bg-dark text-white border-secondary" id="selectCategoria">
                            <option value="">-- Sin categoría --</option>
                            <?php foreach ($categorias as $cat): ?>
                                <option value="<?= $cat['id'] ?>" data-seccion="<?= $cat['seccion'] ?>">
                                    <?= htmlspecialchars($cat['nombre']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Precio Actual (COP) *</label>
                        <input type="number" name="precio" class="form-control bg-dark text-white border-secondary" min="0" step="100" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Precio Anterior (Oferta)</label>
                        <input type="number" name="precio_anterior" class="form-control bg-dark text-white border-secondary" min="0" step="100" placeholder="Opcional">
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Stock *</label>
                        <input type="number" name="stock" class="form-control bg-dark text-white border-secondary" value="1" min="0" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">¿En oferta?</label>
                        <select name="en_oferta" class="form-select bg-dark text-white border-secondary">
                            <option value="0">No</option>
                            <option value="1">Sí — mostrar etiqueta</option>
                        </select>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-bold text-info">Tallas (separadas por coma)</label>
                    <input type="text" name="tallas" class="form-control bg-dark text-white border-info"
                           placeholder="S, M, L, XL" maxlength="100">
                </div>

                <div class="mb-3">
                    <label class="form-label fw-bold text-info">
                        Colores disponibles
                        <small class="text-secondary fw-normal">(separados por coma — deben coincidir con los colores de las imágenes)</small>
                    </label>
                    <input type="text" name="colores" id="inputColores" class="form-control bg-dark text-white border-info"
                           placeholder="negro, blanco, rojo" maxlength="200">
                    <div class="mt-2" id="sugerenciasColores">
                        <small class="text-secondary">Colores usados antes: </small>
                        <?php foreach ($coloresExistentes as $c): ?>
                            <span class="color-tag" onclick="agregarColor('<?= htmlspecialchars($c) ?>')"><?= htmlspecialchars($c) ?></span>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-bold">Descripción</label>
                    <textarea name="descripcion" class="form-control bg-dark text-white border-secondary" rows="2" maxlength="1000"></textarea>
                </div>
            </div>

            <!-- COLUMNA DERECHA: imágenes con color -->
            <div class="col-md-5">
                <div class="card bg-dark border-info p-3">
                    <label class="form-label fw-bold text-info">
                        <i class="bi bi-images me-2"></i>Imágenes del producto
                    </label>
                    <small class="text-secondary d-block mb-3">
                        Agrega cada imagen y asígnale su color. La primera imagen será la portada.
                    </small>

                    <small class="text-secondary d-block mb-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Cada fila = un color. Puedes subir <strong>varias imágenes a la vez</strong> por color (frente, espalda, lado…).
                    </small>

                    <!-- Zona dinámica de imágenes -->
                    <div id="zonaImagenes"></div>

                    <button type="button" class="btn btn-outline-info btn-sm w-100 mt-2" onclick="agregarFilaColor()">
                        <i class="bi bi-plus-circle me-1"></i> Agregar otro color
                    </button>
                </div>
            </div>
        </div>

        <hr class="border-secondary my-4">
        <button type="submit" class="btn btn-success w-100 fw-bold py-3">
            <i class="bi bi-cloud-arrow-up-fill me-2"></i>PUBLICAR PRODUCTO
        </button>
    </form>
</div>

<script>
    let contadorFilas = 0;

    /*
     * Cada "fila" representa UN COLOR con MÚLTIPLES imágenes.
     * El input de archivo tiene multiple, así el admin puede
     * seleccionar frente, espalda, lado... de una sola vez.
     * Todos los archivos de esa fila quedan asociados al mismo color.
     */
    function agregarFilaColor(colorSugerido = '') {
        const zona = document.getElementById('zonaImagenes');
        const idx  = contadorFilas++;
        const esPortada = (idx === 0);

        const div = document.createElement('div');
        div.className = 'img-preview-box';
        div.id = `fila-img-${idx}`;
        div.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-2">
                ${esPortada ? '<span class="badge bg-info text-dark">PORTADA</span>' : ''}
                <label class="form-label mb-0 small fw-bold">
                    ${esPortada ? 'Imágenes principales' : 'Imágenes para este color'}
                </label>
                ${!esPortada ? `<button type="button" class="btn btn-outline-danger btn-sm ms-auto px-2 py-0"
                    onclick="quitarFila(${idx})"><i class="bi bi-x"></i></button>` : ''}
            </div>

            <!-- Input de archivo: multiple permite seleccionar varias a la vez -->
            <input type="file" name="imagenes_color_${idx}[]" accept="image/*" multiple
                   class="form-control form-control-sm bg-black text-white border-secondary mb-2"
                   onchange="previsualizarMultiples(this, ${idx})" ${esPortada ? 'required' : ''}>

            <!-- Fila de previsualizaciones -->
            <div id="previews-${idx}" class="d-flex flex-wrap gap-2 mb-2"></div>

            <!-- Color asociado a TODAS las imágenes de esta fila -->
            <div class="input-group input-group-sm">
                <span class="input-group-text bg-dark text-info border-info">Color</span>
                <input type="text" name="color_grupo_${idx}"
                       id="color-grupo-${idx}"
                       class="form-control bg-dark text-white border-info"
                       placeholder="negro, blanco, rojo… (vacío = sin color)"
                       value="${colorSugerido}" maxlength="60"
                       list="lista-colores-datalist"
                       oninput="sincronizarColorLabel(${idx})">
            </div>
            <small class="text-secondary d-block mt-1">
                <i class="bi bi-info-circle"></i>
                Selecciona <strong>todas</strong> las fotos de este color de una vez (Ctrl+clic / Shift+clic).
            </small>`;
        zona.appendChild(div);
    }

    function quitarFila(idx) {
        const fila = document.getElementById(`fila-img-${idx}`);
        if (fila) fila.remove();
    }

    function previsualizarMultiples(input, idx) {
        const zona = document.getElementById(`previews-${idx}`);
        zona.innerHTML = '';
        Array.from(input.files).forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = e => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'position:relative;';
                wrapper.innerHTML = `
                    <img src="${e.target.result}"
                         style="width:65px;height:65px;object-fit:cover;border-radius:6px;border:1px solid #444;">
                    <small class="d-block text-secondary text-center" style="font-size:0.6rem;max-width:65px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                        ${file.name}
                    </small>`;
                zona.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    function sincronizarColorLabel(idx) {
        // Actualiza el campo de colores del producto automáticamente
        const color = document.getElementById(`color-grupo-${idx}`)?.value.trim();
        const inputColores = document.getElementById('inputColores');
        if (!inputColores || !color) return;
        const lista = inputColores.value.split(',').map(c => c.trim()).filter(Boolean);
        if (!lista.includes(color)) {
            lista.push(color);
            inputColores.value = lista.join(', ');
        }
    }

    function agregarColor(color) {
        const input = document.getElementById('inputColores');
        const actual = input.value.trim();
        if (actual === '') {
            input.value = color;
        } else if (!actual.split(',').map(c => c.trim()).includes(color)) {
            input.value = actual + ', ' + color;
        }
    }

    // Datalist de colores sugeridos
    const datalist = document.createElement('datalist');
    datalist.id = 'lista-colores-datalist';
    <?php foreach ($coloresExistentes as $c): ?>
    datalist.innerHTML += `<option value="<?= htmlspecialchars($c) ?>">`;
    <?php endforeach; ?>
    document.body.appendChild(datalist);

    // Filtrar categorías por sección
    document.getElementById('selectSeccion').addEventListener('change', function() {
        const seccion = this.value;
        document.querySelectorAll('#selectCategoria option[data-seccion]').forEach(opt => {
            opt.style.display = opt.dataset.seccion === seccion ? '' : 'none';
        });
        document.getElementById('selectCategoria').value = '';
    });

    // Agregar primera fila al cargar
    agregarFilaColor();
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
