<?php

/**
 * RECUPERAR CONTRASEÑA
 * Paso 1: El admin pide el correo → se genera token y se envía link
 * Paso 2: El admin llega con el token → puede poner nueva contraseña
 *
 * CONFIGURACIÓN REQUERIDA (edita las constantes de abajo):
 *   MAIL_FROM   → correo desde el que se envía
 *   MAIL_NOMBRE → nombre que aparece en el correo
 *   SITE_URL    → URL base del sitio (sin slash al final)
 */

define('MAIL_FROM',   'noreply@tudominio.com');
define('MAIL_NOMBRE', "Laguna's Admin");
define('SITE_URL',    'http://localhost/laguna_final');

session_start();
require_once "../config/conexion.php";

if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

$paso  = 1;
$msg   = '';
$error = '';
$tokenValido = null;

// ── Si viene con ?token=xxx → verificar ──────────────────────
$tokenGet = trim($_GET['token'] ?? '');
if ($tokenGet !== '') {
    $stmtT = $db->prepare(
        "SELECT pr.*, a.email, a.nombre
         FROM password_resets pr
         JOIN administradores a ON a.id = pr.id_admin
         WHERE pr.token = ? AND pr.usado = 0 AND pr.expira_en > NOW()
         LIMIT 1"
    );
    $stmtT->execute([$tokenGet]);
    $tokenValido = $stmtT->fetch();
    $paso = $tokenValido ? 2 : 1;
    if (!$tokenValido) {
        $error = "El enlace no es válido o ya expiró. Solicita uno nuevo.";
    }
}

// ── POST: solicitar token ─────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['solicitar'])) {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $email = strtolower(trim($_POST['email'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Ingresa un correo válido.";
    } else {
        // Buscar admin con ese correo
        $stmtA = $db->prepare("SELECT * FROM administradores WHERE email = ? AND activo = 1 LIMIT 1");
        $stmtA->execute([$email]);
        $admin = $stmtA->fetch();

        // Siempre mostrar el mismo mensaje (no revelar si el correo existe)
        $msg = "Si ese correo está registrado, recibirás un enlace en los próximos minutos. Revisa también la carpeta de spam.";

        if ($admin) {
            // Invalidar tokens anteriores de ese admin
            $db->prepare("UPDATE password_resets SET usado = 1 WHERE id_admin = ? AND usado = 0")
                ->execute([$admin['id']]);

            // Generar token seguro
            $token     = bin2hex(random_bytes(40)); // 80 chars hex
            $tokenHash = hash('sha256', $token);    // Guardamos el hash, no el token plano
            $ip        = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

            $db->prepare(
                "INSERT INTO password_resets (id_admin, token, expira_en, ip_solicitante)
                 VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), ?)"
            )->execute([$admin['id'], $tokenHash, $ip]);

            // Construir URL
            $url = SITE_URL . '/admin/recuperar_password.php?token=' . urlencode($token);

            // Enviar correo con mail() nativo de PHP
            $asunto  = "Recuperar contraseña — Laguna's Admin";
            $cuerpo  = "Hola {$admin['nombre']},\n\n";
            $cuerpo .= "Recibimos una solicitud para restablecer tu contraseña.\n\n";
            $cuerpo .= "Haz clic en el siguiente enlace (válido por 1 hora):\n\n";
            $cuerpo .= $url . "\n\n";
            $cuerpo .= "Si no solicitaste este cambio, ignora este correo.\n\n";
            $cuerpo .= "— Laguna's Admin";

            $headers  = "From: " . MAIL_NOMBRE . " <" . MAIL_FROM . ">\r\n";
            $headers .= "Reply-To: " . MAIL_FROM . "\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

            @mail($admin['email'], $asunto, $cuerpo, $headers);
        }
    }
}

// ── POST: nueva contraseña ────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nueva_password'])) {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) die("Token inválido.");

    $tokenPost = trim($_POST['token_reset'] ?? '');
    $nueva     = $_POST['password_nueva']    ?? '';
    $confirmar = $_POST['password_confirmar'] ?? '';
    $tokenHash = hash('sha256', $tokenPost);

    // Verificar token de nuevo (defensa extra)
    $stmtV = $db->prepare(
        "SELECT * FROM password_resets
         WHERE token = ? AND usado = 0 AND expira_en > NOW() LIMIT 1"
    );
    $stmtV->execute([$tokenHash]);
    $reset = $stmtV->fetch();

    if (!$reset) {
        $error = "El enlace ya expiró o fue usado. Solicita uno nuevo.";
        $paso  = 1;
    } elseif (strlen($nueva) < 8) {
        $error = "La contraseña debe tener al menos 8 caracteres.";
        $paso  = 2;
        $tokenValido = $reset; // mantener formulario
    } elseif ($nueva !== $confirmar) {
        $error = "Las contraseñas no coinciden.";
        $paso  = 2;
        $tokenValido = $reset;
    } else {
        $hash = password_hash($nueva, PASSWORD_BCRYPT, ['cost' => 12]);

        // Actualizar contraseña
        $db->prepare("UPDATE administradores SET password_hash = ? WHERE id = ?")
            ->execute([$hash, $reset['id_admin']]);

        // Marcar token como usado
        $db->prepare("UPDATE password_resets SET usado = 1 WHERE id = ?")
            ->execute([$reset['id']]);

        $msg = "✅ Contraseña actualizada. Ya puedes iniciar sesión.";
        $paso = 1;
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña | Laguna's Admin</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>

<body>

    <div class="login-card text-center">
        <i class="bi bi-shield-lock" style="font-size:2.8rem; color:#0dcaf0;"></i>
        <h2 class="fw-bold mt-2 mb-1">Recuperar Contraseña</h2>
        <p class="text-secondary small mb-4">
            <?= $paso === 2 ? 'Elige una nueva contraseña segura.' : 'Ingresa tu correo y te enviamos un enlace.' ?>
        </p>

        <?php if ($msg): ?>
            <div class="alert alert-success py-2 small text-start"><?= htmlspecialchars($msg) ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert alert-danger py-2 small text-start"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <?php if ($paso === 1 && !$msg): ?>
            <!-- PASO 1: pedir correo -->
            <form method="POST" autocomplete="off">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="text-start mb-3">
                    <label class="form-label small fw-bold text-secondary text-uppercase">Correo electrónico</label>
                    <input type="email" name="email"
                        class="form-control form-control-lg"
                        placeholder="tucorreo@gmail.com" required maxlength="150">
                </div>
                <button type="submit" name="solicitar" value="1" class="btn btn-cyan w-100 py-2 mb-3">
                    Enviar enlace de recuperación <i class="bi bi-send ms-1"></i>
                </button>
            </form>

        <?php elseif ($paso === 2 && $tokenValido): ?>
            <!-- PASO 2: nueva contraseña -->
            <form method="POST" autocomplete="off">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <input type="hidden" name="token_reset" value="<?= htmlspecialchars($tokenGet ?: $_POST['token_reset'] ?? '') ?>">

                <div class="text-start mb-3">
                    <label class="form-label small fw-bold text-secondary text-uppercase">Nueva contraseña</label>
                    <div class="input-group">
                        <input type="password" name="password_nueva" id="pN"
                            class="form-control form-control-lg"
                            required minlength="8" maxlength="100"
                            oninput="checkF(this.value)">
                        <button class="btn btn-outline-secondary" type="button" onclick="tp('pN','eN')">
                            <i class="bi bi-eye" id="eN"></i>
                        </button>
                    </div>
                    <div class="mt-2">
                        <div class="progress" style="height:4px;">
                            <div id="bF" class="progress-bar" style="width:0%;transition:width 0.3s;"></div>
                        </div>
                        <small id="tF" class="text-secondary"></small>
                    </div>
                </div>

                <div class="text-start mb-4">
                    <label class="form-label small fw-bold text-secondary text-uppercase">Confirmar contraseña</label>
                    <div class="input-group">
                        <input type="password" name="password_confirmar" id="pC"
                            class="form-control form-control-lg"
                            required maxlength="100"
                            oninput="checkC()">
                        <button class="btn btn-outline-secondary" type="button" onclick="tp('pC','eC')">
                            <i class="bi bi-eye" id="eC"></i>
                        </button>
                    </div>
                    <small id="tC"></small>
                </div>

                <button type="submit" name="nueva_password" value="1" class="btn btn-cyan w-100 py-2 mb-3">
                    <i class="bi bi-shield-check me-1"></i>Guardar nueva contraseña
                </button>
            </form>
        <?php endif; ?>

        <a href="index.php" class="text-secondary small">← Volver al login</a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
    <script>
        function tp(iId, eId) {
            const i = document.getElementById(iId),
                e = document.getElementById(eId);
            i.type = i.type === 'password' ? 'text' : 'password';
            e.className = i.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        }

        function checkF(v) {
            let p = 0;
            if (v.length >= 8) p++;
            if (v.length >= 12) p++;
            if (/[A-Z]/.test(v)) p++;
            if (/[0-9]/.test(v)) p++;
            if (/[^A-Za-z0-9]/.test(v)) p++;
            const n = [{
                    pct: 20,
                    c: '#c0392b',
                    l: 'Muy débil'
                }, {
                    pct: 40,
                    c: '#e67e22',
                    l: 'Débil'
                },
                {
                    pct: 60,
                    c: '#f1c40f',
                    l: 'Regular'
                }, {
                    pct: 80,
                    c: '#2ecc71',
                    l: 'Fuerte'
                },
                {
                    pct: 100,
                    c: '#27ae60',
                    l: 'Muy fuerte'
                }
            ][Math.min(p, 4)];
            const b = document.getElementById('bF'),
                t = document.getElementById('tF');
            b.style.width = n.pct + '%';
            b.style.backgroundColor = n.c;
            t.textContent = v.length ? n.l : '';
            t.style.color = n.c;
        }

        function checkC() {
            const v1 = document.getElementById('pN').value;
            const v2 = document.getElementById('pC').value;
            const t = document.getElementById('tC');
            if (!v2) {
                t.textContent = '';
                return;
            }
            if (v1 === v2) {
                t.textContent = '✅ Coinciden';
                t.style.color = '#2ecc71';
            } else {
                t.textContent = '❌ No coinciden';
                t.style.color = '#c0392b';
            }
        }
    </script>
</body>

</html>