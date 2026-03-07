<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: index.php"); exit(); }
require_once "../config/conexion.php";

if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

define('MEDIA_DIR', '../img/');
define('MAX_BYTES', 50 * 1024 * 1024); // 50MB para videos

$msg   = '';
$error = '';

// ════════════════════════════════════════════
// SERVICIOS — CRUD
// ════════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");
    $accion = $_POST['accion'] ?? '';

    // Crear servicio
    if ($accion === 'crear_servicio') {
        $nombre = trim($_POST['nombre'] ?? '');
        $precio = (float)str_replace(['.', ','], ['', '.'], $_POST['precio'] ?? '0');
        $desc   = trim($_POST['descripcion'] ?? '');
        if ($nombre === '' || $precio < 0) {
            $error = "Nombre y precio son obligatorios.";
        } else {
            $orden = (int)$db->query("SELECT COALESCE(MAX(orden),0)+1 FROM barberia_servicios")->fetchColumn();
            $db->prepare("INSERT INTO barberia_servicios (nombre, precio, descripcion, orden) VALUES (?,?,?,?)")
               ->execute([$nombre, $precio, $desc ?: null, $orden]);
            $msg = "✅ Servicio <strong>" . htmlspecialchars($nombre) . "</strong> agregado.";
        }
    }

    // Editar servicio
    if ($accion === 'editar_servicio') {
        $id     = (int)$_POST['id'];
        $nombre = trim($_POST['nombre'] ?? '');
        $precio = (float)str_replace(['.', ','], ['', '.'], $_POST['precio'] ?? '0');
        $desc   = trim($_POST['descripcion'] ?? '');
        if ($id > 0 && $nombre !== '') {
            $db->prepare("UPDATE barberia_servicios SET nombre=?, precio=?, descripcion=? WHERE id=?")
               ->execute([$nombre, $precio, $desc ?: null, $id]);
            $msg = "✅ Servicio actualizado.";
        }
    }

    // Eliminar servicio
    if ($accion === 'eliminar_servicio') {
        $id = (int)$_POST['id'];
        if ($id > 0) {
            $db->prepare("DELETE FROM barberia_servicios WHERE id=?")->execute([$id]);
            $msg = "🗑️ Servicio eliminado.";
        }
    }

    // ════════════════════════════════════════
    // MEDIA — agregar foto o video URL
    // ════════════════════════════════════════
    if ($accion === 'agregar_media') {
        $titulo   = trim($_POST['titulo_media'] ?? '');
        $tipoMedia = $_POST['tipo_media'] ?? 'imagen';
        $urlVideo  = trim($_POST['url_video'] ?? '');
        $orden     = (int)$db->query("SELECT COALESCE(MAX(orden),0)+1 FROM barberia_media")->fetchColumn();

        // Video por URL (YouTube / Instagram)
        if ($tipoMedia === 'video_url' && $urlVideo !== '') {
            // Convertir URL de YouTube a embed si hace falta
            if (preg_match('/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/', $urlVideo, $m)) {
                $urlVideo = "https://www.youtube.com/embed/{$m[1]}";
            } elseif (preg_match('/youtu\.be\/([a-zA-Z0-9_-]+)/', $urlVideo, $m)) {
                $urlVideo = "https://www.youtube.com/embed/{$m[1]}";
            }
            $db->prepare("INSERT INTO barberia_media (tipo, nombre_archivo, url_video, titulo, orden) VALUES ('video','',?,?,?)")
               ->execute([$urlVideo, $titulo ?: null, $orden]);
            $msg = "✅ Video agregado al portafolio.";
        }

        // Imagen o video local subido
        elseif (isset($_FILES['archivo_media']) && $_FILES['archivo_media']['error'] === UPLOAD_ERR_OK) {
            $file    = $_FILES['archivo_media'];
            $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $esVideo = in_array($ext, ['mp4', 'webm', 'mov']);
            $esImg   = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif']);

            if (!$esVideo && !$esImg) {
                $error = "Formato no permitido. Usa JPG, PNG, WEBP, GIF, MP4, WEBM o MOV.";
            } elseif ($file['size'] > MAX_BYTES) {
                $error = "El archivo supera el límite de 50MB.";
            } else {
                $nombre_archivo = time() . '_' . uniqid() . '.' . $ext;
                if (move_uploaded_file($file['tmp_name'], MEDIA_DIR . $nombre_archivo)) {
                    $tipo = $esVideo ? 'video' : 'imagen';
                    $db->prepare("INSERT INTO barberia_media (tipo, nombre_archivo, titulo, orden) VALUES (?,?,?,?)")
                       ->execute([$tipo, $nombre_archivo, $titulo ?: null, $orden]);
                    $msg = "✅ " . ($esVideo ? "Video" : "Imagen") . " <strong>" . htmlspecialchars($titulo ?: $nombre_archivo) . "</strong> agregado.";
                } else {
                    $error = "Error al guardar el archivo. Verifica permisos de la carpeta /img/.";
                }
            }
        } else {
            $error = "Selecciona un archivo o pega una URL de video.";
        }
    }

    // Eliminar media
    if ($accion === 'eliminar_media') {
        $id = (int)$_POST['id'];
        if ($id > 0) {
            $row = $db->prepare("SELECT nombre_archivo, tipo FROM barberia_media WHERE id=?");
            $row->execute([$id]);
            $item = $row->fetch();
            // Borrar archivo físico si es local
            if ($item && $item['nombre_archivo'] && file_exists(MEDIA_DIR . $item['nombre_archivo'])) {
                @unlink(MEDIA_DIR . $item['nombre_archivo']);
            }
            $db->prepare("DELETE FROM barberia_media WHERE id=?")->execute([$id]);
            $msg = "🗑️ Eliminado del portafolio.";
        }
    }

    // Cambiar orden media (subir / bajar)
    if ($accion === 'mover_media') {
        $id  = (int)$_POST['id'];
        $dir = $_POST['dir'] ?? '';
        $item = $db->prepare("SELECT id, orden FROM barberia_media WHERE id=?");
        $item->execute([$id]);
        $current = $item->fetch();
        if ($current) {
            if ($dir === 'up') {
                $swap = $db->prepare("SELECT id, orden FROM barberia_media WHERE orden < ? ORDER BY orden DESC LIMIT 1");
            } else {
                $swap = $db->prepare("SELECT id, orden FROM barberia_media WHERE orden > ? ORDER BY orden ASC LIMIT 1");
            }
            $swap->execute([$current['orden']]);
            $other = $swap->fetch();
            if ($other) {
                $db->prepare("UPDATE barberia_media SET orden=? WHERE id=?")->execute([$other['orden'], $current['id']]);
                $db->prepare("UPDATE barberia_media SET orden=? WHERE id=?")->execute([$current['orden'], $other['id']]);
            }
        }
    }
}

// Cargar datos actuales
$servicios = $db->query("SELECT * FROM barberia_servicios ORDER BY orden ASC")->fetchAll();
$medias    = $db->query("SELECT * FROM barberia_media    ORDER BY orden ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barbería Admin | Laguna's</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="container py-5">

    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
            <h2 class="fw-bold">✂️ Gestión de Barbería</h2>
            <p class="text-secondary mb-0">Edita servicios, precios y portafolio multimedia.</p>
        </div>
        <a href="panel.php" class="btn btn-outline-light">← Volver al Panel</a>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-success alert-dismissible fade show">
            <?= $msg ?><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show">
            <?= $error ?><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- ════ TABS ════ -->
    <ul class="nav nav-tabs mb-4 border-secondary" id="barbTab">
        <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-servicios">
                <i class="bi bi-scissors me-1"></i>Servicios &amp; Precios
                <span class="badge bg-secondary ms-1"><?= count($servicios) ?></span>
            </button>
        </li>
        <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-portafolio">
                <i class="bi bi-images me-1"></i>Portafolio
                <span class="badge bg-secondary ms-1"><?= count($medias) ?></span>
            </button>
        </li>
    </ul>

    <div class="tab-content">

        <!-- ════ TAB SERVICIOS ════ -->
        <div class="tab-pane fade show active" id="tab-servicios">
            <div class="row g-4">

                <!-- Formulario nuevo servicio -->
                <div class="col-lg-4">
                    <div class="card bg-dark border-info p-4">
                        <h5 class="fw-bold text-info mb-3"><i class="bi bi-plus-circle me-2"></i>Nuevo Servicio</h5>
                        <form method="POST">
                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                            <input type="hidden" name="accion" value="crear_servicio">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Nombre del corte / servicio *</label>
                                <input type="text" name="nombre" class="form-control bg-black text-white border-secondary"
                                       placeholder="Ej: Corte + Diseño" maxlength="150" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Precio (COP) *</label>
                                <input type="number" name="precio" class="form-control bg-black text-white border-secondary"
                                       placeholder="25000" min="0" step="500" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label small fw-bold">Descripción <span class="text-secondary">(opcional)</span></label>
                                <input type="text" name="descripcion" class="form-control bg-black text-white border-secondary"
                                       placeholder="Incluye lavado, secado..." maxlength="255">
                            </div>
                            <button type="submit" class="btn btn-info w-100 fw-bold">
                                <i class="bi bi-plus-lg me-1"></i>Agregar Servicio
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Lista de servicios -->
                <div class="col-lg-8">
                    <h5 class="fw-bold mb-3">Servicios actuales</h5>
                    <?php if (empty($servicios)): ?>
                        <p class="text-secondary">No hay servicios aún.</p>
                    <?php else: ?>
                    <div class="table-responsive">
                    <table class="table table-dark table-hover align-middle">
                        <thead><tr>
                            <th>Servicio</th><th>Descripción</th><th class="text-end">Precio</th><th>Acciones</th>
                        </tr></thead>
                        <tbody>
                        <?php foreach ($servicios as $s): ?>
                        <tr>
                            <td class="fw-bold"><?= htmlspecialchars($s['nombre']) ?></td>
                            <td class="text-secondary small"><?= htmlspecialchars($s['descripcion'] ?? '—') ?></td>
                            <td class="text-end fw-bold text-info">$<?= number_format($s['precio'], 0, ',', '.') ?></td>
                            <td>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-warning"
                                            onclick="abrirEditarServicio(<?= $s['id'] ?>, '<?= htmlspecialchars($s['nombre'], ENT_QUOTES) ?>', <?= $s['precio'] ?>, '<?= htmlspecialchars($s['descripcion'] ?? '', ENT_QUOTES) ?>')">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form method="POST" onsubmit="return confirm('¿Eliminar este servicio?')">
                                        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                        <input type="hidden" name="accion" value="eliminar_servicio">
                                        <input type="hidden" name="id" value="<?= $s['id'] ?>">
                                        <button type="submit" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
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

        <!-- ════ TAB PORTAFOLIO ════ -->
        <div class="tab-pane fade" id="tab-portafolio">
            <div class="row g-4">

                <!-- Formulario agregar media -->
                <div class="col-lg-4">
                    <div class="card bg-dark border-info p-4">
                        <h5 class="fw-bold text-info mb-3"><i class="bi bi-cloud-upload me-2"></i>Agregar al Portafolio</h5>
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                            <input type="hidden" name="accion" value="agregar_media">

                            <div class="mb-3">
                                <label class="form-label small fw-bold">Tipo</label>
                                <select name="tipo_media" id="tipoMedia" class="form-select bg-black text-white border-secondary"
                                        onchange="toggleTipoMedia(this.value)">
                                    <option value="imagen">🖼️ Foto (JPG, PNG, WEBP)</option>
                                    <option value="video_archivo">🎬 Video subido (MP4, WEBM)</option>
                                    <option value="video_url">🔗 Video por URL (YouTube)</option>
                                </select>
                            </div>

                            <div id="zona-archivo">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Archivo</label>
                                    <input type="file" name="archivo_media" id="archivoMedia"
                                           accept="image/*,video/mp4,video/webm,video/quicktime"
                                           class="form-control bg-black text-white border-secondary">
                                    <small class="text-secondary">Máx 50MB para videos, 5MB para fotos.</small>
                                </div>
                            </div>

                            <div id="zona-url" style="display:none;">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">URL del video</label>
                                    <input type="url" name="url_video"
                                           class="form-control bg-black text-white border-secondary"
                                           placeholder="https://www.youtube.com/watch?v=...">
                                    <small class="text-secondary">Pega la URL de YouTube. Se convierte automáticamente.</small>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label small fw-bold">Título <span class="text-secondary">(opcional)</span></label>
                                <input type="text" name="titulo_media"
                                       class="form-control bg-black text-white border-secondary"
                                       placeholder="Ej: Fade bajo, Barba completa..." maxlength="150">
                            </div>

                            <button type="submit" class="btn btn-info w-100 fw-bold">
                                <i class="bi bi-cloud-arrow-up-fill me-1"></i>Subir al Portafolio
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Grid del portafolio actual -->
                <div class="col-lg-8">
                    <h5 class="fw-bold mb-3">Portafolio actual</h5>
                    <?php if (empty($medias)): ?>
                        <p class="text-secondary">No hay fotos ni videos aún.</p>
                    <?php else: ?>
                    <div class="row g-3">
                        <?php foreach ($medias as $m): ?>
                        <div class="col-6 col-md-4">
                            <div class="card bg-dark border-secondary h-100">
                                <!-- Preview -->
                                <div style="height:150px; overflow:hidden; background:#111; display:flex; align-items:center; justify-content:center;">
                                    <?php if ($m['tipo'] === 'imagen'): ?>
                                        <img src="../img/<?= htmlspecialchars($m['nombre_archivo']) ?>"
                                             style="width:100%;height:150px;object-fit:cover;"
                                             onerror="this.src='../img/no-image.png'">
                                    <?php elseif ($m['tipo'] === 'video' && !empty($m['url_video'])): ?>
                                        <div class="text-center text-secondary p-3">
                                            <i class="bi bi-youtube fs-1 text-danger"></i>
                                            <p class="small mt-1 mb-0">Video externo</p>
                                        </div>
                                    <?php else: ?>
                                        <div class="text-center text-secondary p-3">
                                            <i class="bi bi-camera-video-fill fs-1 text-info"></i>
                                            <p class="small mt-1 mb-0">Video local</p>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                <div class="card-body p-2">
                                    <p class="small fw-bold mb-1 text-truncate">
                                        <?= htmlspecialchars($m['titulo'] ?? ($m['nombre_archivo'] ?: 'Video externo')) ?>
                                    </p>
                                    <span class="badge <?= $m['tipo'] === 'imagen' ? 'bg-secondary' : 'bg-info text-dark' ?> mb-2">
                                        <?= $m['tipo'] === 'imagen' ? '🖼️ Foto' : '🎬 Video' ?>
                                    </span>
                                    <div class="d-flex gap-1 mt-1">
                                        <!-- Subir / bajar orden -->
                                        <form method="POST" class="d-inline">
                                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                            <input type="hidden" name="accion" value="mover_media">
                                            <input type="hidden" name="id" value="<?= $m['id'] ?>">
                                            <input type="hidden" name="dir" value="up">
                                            <button class="btn btn-sm btn-outline-secondary px-2 py-0" title="Subir">↑</button>
                                        </form>
                                        <form method="POST" class="d-inline">
                                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                            <input type="hidden" name="accion" value="mover_media">
                                            <input type="hidden" name="id" value="<?= $m['id'] ?>">
                                            <input type="hidden" name="dir" value="down">
                                            <button class="btn btn-sm btn-outline-secondary px-2 py-0" title="Bajar">↓</button>
                                        </form>
                                        <!-- Eliminar -->
                                        <form method="POST" class="d-inline ms-auto"
                                              onsubmit="return confirm('¿Eliminar este elemento del portafolio?')">
                                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                                            <input type="hidden" name="accion" value="eliminar_media">
                                            <input type="hidden" name="id" value="<?= $m['id'] ?>">
                                            <button class="btn btn-sm btn-danger px-2 py-0">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal editar servicio -->
<div class="modal fade" id="modalEditarServicio" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold">✏️ Editar Servicio</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <input type="hidden" name="accion" value="editar_servicio">
                <input type="hidden" name="id" id="edit-id">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Nombre del servicio</label>
                        <input type="text" name="nombre" id="edit-nombre"
                               class="form-control bg-black text-white border-secondary" required maxlength="150">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Precio (COP)</label>
                        <input type="number" name="precio" id="edit-precio"
                               class="form-control bg-black text-white border-secondary" min="0" step="500" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Descripción</label>
                        <input type="text" name="descripcion" id="edit-desc"
                               class="form-control bg-black text-white border-secondary" maxlength="255">
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning fw-bold">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
<script>
function abrirEditarServicio(id, nombre, precio, desc) {
    document.getElementById('edit-id').value     = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-precio').value = precio;
    document.getElementById('edit-desc').value   = desc;
    new bootstrap.Modal(document.getElementById('modalEditarServicio')).show();
}

function toggleTipoMedia(val) {
    const zonaArchivo = document.getElementById('zona-archivo');
    const zonaUrl     = document.getElementById('zona-url');
    const inputFile   = document.getElementById('archivoMedia');

    if (val === 'video_url') {
        zonaArchivo.style.display = 'none';
        zonaUrl.style.display     = '';
        inputFile.removeAttribute('required');
    } else {
        zonaArchivo.style.display = '';
        zonaUrl.style.display     = 'none';
        if (val === 'imagen') {
            inputFile.accept = 'image/*';
        } else {
            inputFile.accept = 'video/mp4,video/webm,video/quicktime';
        }
    }
}
</script>
</body>
</html>
