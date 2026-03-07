<?php
include("config/conexion.php");

$servicios = $db->query(
    "SELECT * FROM barberia_servicios WHERE activo = 1 ORDER BY orden ASC"
)->fetchAll();

$media = $db->query(
    "SELECT * FROM barberia_media WHERE activo = 1 ORDER BY orden ASC"
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barbería | Laguna's Barber &amp; Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/barberia.css">
</head>

<body class="bg-black text-white">

    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-secondary">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="index_.php">
                <img src="img/logo-artguru.png" alt="Logo" height="40" class="me-2">
                <span style="font-family:'Bebas Neue'; letter-spacing:1px">VOLVER AL INICIO</span>
            </a>
        </div>
    </nav>

    <header class="py-5 text-center border-bottom border-secondary">
        <h1 class="display-3 fw-bold main-title">NUESTROS SERVICIOS</h1>
        <p class="text-secondary">Maestría en cada corte, tradición en cada detalle.</p>
    </header>

    <!-- Lista de precios dinámica -->
    <section class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="pricing-card p-4 border border-secondary rounded">
                    <h3 class="text-center mb-4 text-uppercase main-title">Lista de Precios</h3>
                    <?php foreach ($servicios as $i => $s): ?>
                        <div class="d-flex justify-content-between mb-3 <?= $i < count($servicios) - 1 ? 'border-bottom border-secondary pb-2' : '' ?>">
                            <span><?= htmlspecialchars($s['nombre']) ?></span>
                            <span class="fw-bold">$<?= number_format($s['precio'], 0, ',', '.') ?></span>
                        </div>
                    <?php endforeach; ?>
                    <?php if (empty($servicios)): ?>
                        <p class="text-secondary text-center">No hay servicios registrados aún.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- Portafolio dinámico (fotos + videos) -->
    <?php if (!empty($media)): ?>
        <section class="container py-5">
            <h2 class="text-center mb-5 main-title" style="font-size:2.5rem;">Nuestro Estilo</h2>
            <div class="row g-4">
                <?php foreach ($media as $m): ?>
                    <div class="col-6 col-md-4">
                        <?php if ($m['tipo'] === 'video' && !empty($m['url_video'])): ?>
                            <!-- Video externo (YouTube / Instagram embed) -->
                            <div class="portfolio-item ratio ratio-16x9">
                                <iframe src="<?= htmlspecialchars($m['url_video']) ?>"
                                    title="<?= htmlspecialchars($m['titulo'] ?? 'Video') ?>"
                                    allowfullscreen
                                    style="border:none; width:100%; height:100%;"></iframe>
                            </div>
                        <?php elseif ($m['tipo'] === 'video' && !empty($m['nombre_archivo'])): ?>
                            <!-- Video local subido -->
                            <div class="portfolio-item">
                                <video controls class="img-fluid rounded shadow w-100"
                                    style="max-height:280px; object-fit:cover;">
                                    <source src="img/<?= htmlspecialchars($m['nombre_archivo']) ?>">
                                </video>
                            </div>
                        <?php else: ?>
                            <!-- Imagen -->
                            <div class="portfolio-item">
                                <img src="img/<?= htmlspecialchars($m['nombre_archivo']) ?>"
                                    class="img-fluid rounded shadow"
                                    alt="<?= htmlspecialchars($m['titulo'] ?? 'Corte') ?>"
                                    loading="lazy">
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($m['titulo'])): ?>
                            <p class="text-center text-secondary small mt-2"><?= htmlspecialchars($m['titulo']) ?></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>

    <!-- CTA WhatsApp -->
    <section class="bg-dark py-5 text-center">
        <div class="container">
            <h2 class="main-title">¿Quieres visitarnos?</h2>
            <p>Atendemos por orden de llegada o consulta disponibilidad inmediata.</p>
            <a href="+57 302 8326617" class="btn btn-success btn-pill mt-3">
                <i class="bi bi-whatsapp me-2"></i>Consultar por WhatsApp
            </a>
            <div class="mt-4">
                <p class="mb-0 text-secondary">📍 Calle 5 Av 11E-17 , Quinta Oriental Cucuta Norte de Santander</p>
                <p class="text-secondary">⏰ Lunes a Sábado: 9:00 AM – 8:00 PM</p>
            </div>
        </div>
    </section>

    <!-- Redes sociales -->
    <section class="py-5 bg-black">
        <div class="container text-center">
            <h2 class="mb-4 main-title" style="font-size: 2.5rem; letter-spacing: 2px;">SÍGUENOS EN EL BARRIO DIGITAL</h2>
            <p class="text-secondary mb-5">Mira nuestros últimos trabajos y nuevos lanzamientos de ropa.</p>
            <div class="row justify-content-center g-4">
                <div class="col-6 col-md-3">
                    <a href="https://www.tiktok.com/@lagunas353?_r=1&_t=ZS-94RYFz62saL" target="_blank" rel="noopener" class="social-link tiktok">
                        <i class="bi bi-tiktok fs-1"></i>
                        <p class="mt-2 fw-bold">TIKTOK</p>
                    </a>
                </div>
                <div class="col-6 col-md-3">
                    <a href="https://www.instagram.com/lagunas_barberandshop/" target="_blank" rel="noopener" class="social-link instagram">
                        <i class="bi bi-instagram fs-1"></i>
                        <p class="mt-2 fw-bold">INSTAGRAM</p>
                    </a>
                </div>
                <div class="col-6 col-md-3">
                    <a href="https://www.facebook.com/share/1GJq3KyLt8/?mibextid=wwXIfr" target="_blank" rel="noopener" class="social-link facebook">
                        <i class="bi bi-facebook fs-1"></i>
                        <p class="mt-2 fw-bold">FACEBOOK</p>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <footer class="py-4 text-center border-top border-secondary">
        <p class="small text-secondary mb-0">&copy; 2026 Laguna's Barber Shop</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>