<?php
/**
 * CAMBIAR CONTRASEÑA — Panel Admin
 * Solo accesible con sesión activa.
 * Requiere contraseña actual para confirmar identidad.
 */
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: index.php"); exit(); }
require_once "../config/conexion.php";

if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

$msg   = '';
$error = '';

// Cargar datos del admin actual
$stmtAdmin = $db->prepare("SELECT * FROM administradores WHERE id = ?");
$stmtAdmin->execute([$_SESSION['admin_id']]);
$admin = $stmtAdmin->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $accion = $_POST['accion'] ?? '';

    // ── Cambiar contraseña ─────────────────────────────────────
    if ($accion === 'cambiar_password') {
        $actual    = $_POST['password_actual']   ?? '';
        $nueva     = $_POST['password_nueva']    ?? '';
        $confirmar = $_POST['password_confirmar'] ?? '';

        if ($actual === '' || $nueva === '' || $confirmar === '') {
            $error = "Completa todos los campos.";
        } elseif (!password_verify($actual, $admin['password_hash'])) {
            $error = "La contraseña actual es incorrecta.";
        } elseif (strlen($nueva) < 8) {
            $error = "La nueva contraseña debe tener al menos 8 caracteres.";
        } elseif ($nueva !== $confirmar) {
            $error = "Las contraseñas nuevas no coinciden.";
        } elseif (password_verify($nueva, $admin['password_hash'])) {
            $error = "La nueva contraseña no puede ser igual a la actual.";
        } else {
            $hash = password_hash($nueva, PASSWORD_BCRYPT, ['cost' => 12]);
            $db->prepare("UPDATE administradores SET password_hash = ? WHERE id = ?")
               ->execute([$hash, $_SESSION['admin_id']]);
            // Invalidar todos los tokens de recuperación pendientes
            $db->prepare("UPDATE password_resets SET usado = 1 WHERE id_admin = ?")
               ->execute([$_SESSION['admin_id']]);
            $msg = "✅ Contraseña actualizada correctamente.";
        }
    }

    // ── Actualizar email ───────────────────────────────────────
    if ($accion === 'actualizar_email') {
        $email = trim($_POST['email'] ?? '');
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = "El correo electrónico no es válido.";
        } else {
            $db->prepare("UPDATE administradores SET email = ? WHERE id = ?")
               ->execute([$email ?: null, $_SESSION['admin_id']]);
            $admin['email'] = $email;
            $msg = "✅ Correo de recuperación actualizado.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar Contraseña | Laguna's Admin</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="container py-5" style="max-width:600px;">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold">🔒 Mi Cuenta</h2>
            <p class="text-secondary mb-0"><?= htmlspecialchars($admin['nombre']) ?></p>
        </div>
        <a href="panel.php" class="btn btn-outline-light btn-sm">← Volver al Panel</a>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-success alert-dismissible fade show">
            <?= $msg ?><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show">
            <?= htmlspecialchars($error) ?><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- ── Cambiar contraseña ── -->
    <div class="card bg-dark border-secondary p-4 mb-4">
        <h5 class="fw-bold mb-1"><i class="bi bi-key-fill me-2 text-warning"></i>Cambiar Contraseña</h5>
        <p class="text-secondary small mb-4">Necesitas ingresar tu contraseña actual para confirmar el cambio.</p>
        <form method="POST" autocomplete="off">
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
            <input type="hidden" name="accion"     value="cambiar_password">

            <div class="mb-3">
                <label class="form-label small fw-bold">Contraseña actual</label>
                <div class="input-group">
                    <input type="password" name="password_actual" id="passActual"
                           class="form-control bg-black text-white border-secondary"
                           required maxlength="100" autocomplete="current-password">
                    <button class="btn btn-outline-secondary" type="button" onclick="togglePass('passActual','eyeActual')">
                        <i class="bi bi-eye" id="eyeActual"></i>
                    </button>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small fw-bold">Nueva contraseña</label>
                <div class="input-group">
                    <input type="password" name="password_nueva" id="passNueva"
                           class="form-control bg-black text-white border-secondary"
                           required minlength="8" maxlength="100" autocomplete="new-password"
                           oninput="checkFortaleza(this.value)">
                    <button class="btn btn-outline-secondary" type="button" onclick="togglePass('passNueva','eyeNueva')">
                        <i class="bi bi-eye" id="eyeNueva"></i>
                    </button>
                </div>
                <!-- Indicador de fortaleza -->
                <div class="mt-2">
                    <div class="progress" style="height:4px;">
                        <div id="barraFortaleza" class="progress-bar" style="width:0%; transition:width 0.3s;"></div>
                    </div>
                    <small id="textoFortaleza" class="text-secondary"></small>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label small fw-bold">Confirmar nueva contraseña</label>
                <div class="input-group">
                    <input type="password" name="password_confirmar" id="passConfirmar"
                           class="form-control bg-black text-white border-secondary"
                           required maxlength="100" autocomplete="new-password"
                           oninput="checkCoincidencia()">
                    <button class="btn btn-outline-secondary" type="button" onclick="togglePass('passConfirmar','eyeConfirmar')">
                        <i class="bi bi-eye" id="eyeConfirmar"></i>
                    </button>
                </div>
                <small id="textoCoincidencia"></small>
            </div>

            <button type="submit" class="btn btn-warning w-100 fw-bold">
                <i class="bi bi-shield-lock-fill me-2"></i>Actualizar Contraseña
            </button>
        </form>
    </div>

    <!-- ── Email de recuperación ── -->
    <div class="card bg-dark border-secondary p-4">
        <h5 class="fw-bold mb-1"><i class="bi bi-envelope-fill me-2 text-info"></i>Correo de Recuperación</h5>
        <p class="text-secondary small mb-4">
            Se usa para enviarte un enlace si olvidas tu contraseña.
            <?php if (empty($admin['email'])): ?>
                <span class="text-warning">⚠️ No tienes un correo configurado aún.</span>
            <?php else: ?>
                <span class="text-success">✅ Configurado: <strong><?= htmlspecialchars($admin['email']) ?></strong></span>
            <?php endif; ?>
        </p>
        <form method="POST">
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
            <input type="hidden" name="accion"     value="actualizar_email">
            <div class="mb-3">
                <label class="form-label small fw-bold">Correo electrónico</label>
                <input type="email" name="email"
                       class="form-control bg-black text-white border-secondary"
                       value="<?= htmlspecialchars($admin['email'] ?? '') ?>"
                       placeholder="tucorreo@gmail.com" maxlength="150">
            </div>
            <button type="submit" class="btn btn-info w-100 fw-bold">
                <i class="bi bi-save me-2"></i>Guardar Correo
            </button>
        </form>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
<script>
function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon  = document.getElementById(iconId);
    input.type  = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
}

function checkFortaleza(val) {
    const barra = document.getElementById('barraFortaleza');
    const texto = document.getElementById('textoFortaleza');
    let puntos = 0;
    if (val.length >= 8)                    puntos++;
    if (val.length >= 12)                   puntos++;
    if (/[A-Z]/.test(val))                  puntos++;
    if (/[0-9]/.test(val))                  puntos++;
    if (/[^A-Za-z0-9]/.test(val))           puntos++;

    const niveles = [
        { pct: 20,  color: '#c0392b', label: 'Muy débil'  },
        { pct: 40,  color: '#e67e22', label: 'Débil'      },
        { pct: 60,  color: '#f1c40f', label: 'Regular'    },
        { pct: 80,  color: '#2ecc71', label: 'Fuerte'     },
        { pct: 100, color: '#27ae60', label: 'Muy fuerte' },
    ];
    const n = niveles[Math.min(puntos, 4)];
    barra.style.width           = n.pct + '%';
    barra.style.backgroundColor = n.color;
    texto.textContent           = val.length ? n.label : '';
    texto.style.color           = n.color;
}

function checkCoincidencia() {
    const nueva     = document.getElementById('passNueva').value;
    const confirmar = document.getElementById('passConfirmar').value;
    const texto     = document.getElementById('textoCoincidencia');
    if (!confirmar) { texto.textContent = ''; return; }
    if (nueva === confirmar) {
        texto.textContent = '✅ Las contraseñas coinciden';
        texto.style.color = '#2ecc71';
    } else {
        texto.textContent = '❌ No coinciden';
        texto.style.color = '#c0392b';
    }
}
</script>
</body>
</html>
