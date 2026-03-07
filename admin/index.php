<?php
/**
 * LOGIN SEGURO — Panel Admin
 * - Usa PDO + prepared statements (sin inyección SQL)
 * - Contraseña con bcrypt (password_hash / password_verify)
 * - Bloqueo temporal tras 5 intentos fallidos
 * - Log de accesos en BD
 * - Protección de sesión con regeneración de ID
 */

session_start();

// Si ya hay sesión activa, redirigir al panel
if (isset($_SESSION['admin_id'])) {
    header("Location: panel.php");
    exit();
}

require_once "../config/conexion.php";

$error = "";

// ── Constantes de seguridad ──────────────────────────────────
define('MAX_INTENTOS',     5);   // Bloqueo tras N fallos
define('BLOQUEO_SEGUNDOS', 300); // 5 minutos de bloqueo

// ── Obtener IP del visitante ─────────────────────────────────
function getIP(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
}

// ── Contar intentos fallidos recientes por IP ────────────────
function intentosFallidos(PDO $db, string $ip): int {
    $stmt = $db->prepare(
        "SELECT COUNT(*) FROM log_accesos
         WHERE ip = ? AND exitoso = 0
           AND intentado_en >= NOW() - INTERVAL ? SECOND"
    );
    $stmt->execute([$ip, BLOQUEO_SEGUNDOS]);
    return (int) $stmt->fetchColumn();
}

// ── Registrar intento en log ──────────────────────────────────
function registrarLog(PDO $db, string $usuario, string $ip, bool $exitoso): void {
    $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300);
    $db->prepare(
        "INSERT INTO log_accesos (usuario, ip, exitoso, user_agent) VALUES (?, ?, ?, ?)"
    )->execute([$usuario, $ip, $exitoso ? 1 : 0, $ua]);
}

// ── Procesar formulario POST ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $ip      = getIP();
    $fallos  = intentosFallidos($db, $ip);

    // Verificar bloqueo por intentos
    if ($fallos >= MAX_INTENTOS) {
        $error = "Demasiados intentos fallidos. Espera 5 minutos.";
    } else {

        // Sanitizar input (solo limpiar espacios — PDO protege contra inyección)
        $usuario    = trim($_POST['usuario']  ?? '');
        $contrasena = trim($_POST['password'] ?? '');

        if ($usuario === '' || $contrasena === '') {
            $error = "Completa todos los campos.";
        } else {

            // Buscar administrador por usuario (NO por contraseña — bcrypt lo verifica después)
            $stmt = $db->prepare(
                "SELECT id, usuario, password_hash, nombre, activo
                 FROM administradores WHERE usuario = ? LIMIT 1"
            );
            $stmt->execute([$usuario]);
            $admin = $stmt->fetch();

            if ($admin && $admin['activo'] == 1 && password_verify($contrasena, $admin['password_hash'])) {

                // ✅ LOGIN EXITOSO
                registrarLog($db, $usuario, $ip, true);

                // Actualizar último acceso
                $db->prepare("UPDATE administradores SET ultimo_acceso = NOW() WHERE id = ?")
                   ->execute([$admin['id']]);

                // Regenerar ID de sesión (evita session fixation)
                session_regenerate_id(true);

                $_SESSION['admin_id']     = $admin['id'];
                $_SESSION['admin_nombre'] = $admin['nombre'];
                $_SESSION['admin_usuario']= $admin['usuario'];

                header("Location: panel.php");
                exit();

            } else {
                // ❌ LOGIN FALLIDO
                registrarLog($db, $usuario, $ip, false);

                $restantes = MAX_INTENTOS - ($fallos + 1);
                $error = "Usuario o contraseña incorrectos." .
                         ($restantes > 0 ? " Te quedan $restantes intentos." : " Tu IP será bloqueada.");
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin | Laguna's Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>

    <div class="login-card text-center">
        <i class="bi bi-person-lock" style="font-size:3rem;color:#0dcaf0;"></i>
        <h2 class="fw-bold mb-4 mt-2">LAGUNA'S ADMIN</h2>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2 small" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i><?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" autocomplete="off" novalidate>
            <!-- Token CSRF -->
            <?php
                if (empty($_SESSION['csrf_token'])) {
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                }
            ?>
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

            <div class="text-start mb-3">
                <label class="form-label small fw-bold text-secondary text-uppercase">Usuario</label>
                <input type="text" name="usuario" class="form-control form-control-lg"
                       placeholder="Admin" required maxlength="60" autocomplete="username">
            </div>

            <div class="text-start mb-4">
                <label class="form-label small fw-bold text-secondary text-uppercase">Contraseña</label>
                <div class="input-group">
                    <input type="password" name="password" id="passInput"
                           class="form-control form-control-lg"
                           placeholder="••••••••" required maxlength="100"
                           autocomplete="current-password">
                    <button class="btn btn-outline-secondary" type="button" id="togglePass">
                        <i class="bi bi-eye" id="eyeIcon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn btn-cyan w-100 py-2 mb-3">
                INGRESAR AL PANEL <i class="bi bi-arrow-right-short"></i>
            </button>
        </form>

        <p class="text-secondary small mb-0">Acceso restringido a personal autorizado.</p>
        <a href="recuperar_password.php" class="text-secondary small d-block mt-2">¿Olvidaste tu contraseña?</a>
    </div>

    <script>
        document.getElementById('togglePass').addEventListener('click', function() {
            const input = document.getElementById('passInput');
            const icon  = document.getElementById('eyeIcon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            }
        });
    </script>
</body>
</html>
