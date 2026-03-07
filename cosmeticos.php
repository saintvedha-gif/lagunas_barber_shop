<?php
include("config/conexion.php");

$cat_filtro = trim($_GET['cat'] ?? '');

if ($cat_filtro !== '') {
    $stmt = $db->prepare(
        "SELECT p.*, pi.nombre_archivo AS imagen_portada
         FROM productos p
         LEFT JOIN producto_imagenes pi ON pi.id_producto = p.id AND pi.es_portada = 1
         WHERE p.seccion = 'cosmetico' AND p.activo = 1 AND p.id_categoria = (
             SELECT id FROM categorias WHERE nombre = ? AND seccion = 'cosmetico' LIMIT 1
         )
         ORDER BY p.id DESC"
    );
    $stmt->execute([$cat_filtro]);
} else {
    $stmt = $db->prepare(
        "SELECT p.*, pi.nombre_archivo AS imagen_portada
         FROM productos p
         LEFT JOIN producto_imagenes pi ON pi.id_producto = p.id AND pi.es_portada = 1
         WHERE p.seccion = 'cosmetico' AND p.activo = 1
         ORDER BY p.id DESC"
    );
    $stmt->execute();
}
$productos = $stmt->fetchAll();

$stmtCats = $db->prepare(
    "SELECT id, nombre FROM categorias WHERE seccion = 'cosmetico' ORDER BY nombre"
);
$stmtCats->execute();
$categorias = $stmtCats->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cosméticos | Laguna's Barber &amp; Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/shop.css">
    <link rel="stylesheet" href="css/cart.css">
</head>
<body class="bg-black text-white">

    <!-- Carrito flotante -->
    <div id="cart-floating" class="cart-floating shadow-lg" data-bs-toggle="modal" data-bs-target="#modalCarrito">
        <i class="bi bi-bag-fill"></i>
        <span id="cart-count" class="badge rounded-pill bg-danger">0</span>
    </div>

    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-secondary">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="index_.php">
                <img src="img/logo-artguru.png" alt="Logo" height="40" class="me-2">
                <span style="font-family:'Bebas Neue'; letter-spacing:1px">VOLVER AL INICIO</span>
            </a>
        </div>
    </nav>

    <header class="py-5 text-center">
        <h1 class="display-3 fw-bold main-title">CUIDADO CAPILAR</h1>
        <p class="text-secondary text-uppercase" style="letter-spacing:3px">
            Productos premium para mantener tu estilo en casa
        </p>
    </header>

    <main class="container-fluid px-lg-5 pb-5">
        <div class="row">

            <!-- Sidebar -->
            <aside class="col-lg-3 mb-4">
                <div class="sticky-top" style="top:90px">
                    <h5 class="fw-bold mb-3" style="font-family:'Bebas Neue'; color:#aaa">CATEGORÍAS</h5>
                    <div class="list-group list-group-flush custom-sidebar mb-4">
                        <a href="cosmeticos.php"
                           class="list-group-item list-group-item-action <?= ($cat_filtro == '') ? 'active' : '' ?>">
                            TODO
                        </a>
                        <?php foreach ($categorias as $cat): ?>
                            <a href="cosmeticos.php?cat=<?= urlencode($cat['nombre']) ?>"
                               class="list-group-item list-group-item-action <?= ($cat_filtro == $cat['nombre']) ? 'active' : '' ?>">
                                <?= strtoupper(htmlspecialchars($cat['nombre'])) ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                    <h5 class="fw-bold mb-3" style="font-family:'Bebas Neue'; color:#aaa">BÚSQUEDA RÁPIDA</h5>
                    <input type="text" id="inputBusqueda"
                           class="form-control bg-dark text-white border-secondary"
                           placeholder="Buscar producto...">
                </div>
            </aside>

            <!-- Productos -->
            <section class="col-lg-9">
                <div class="row g-4" id="contenedorProductos">

                    <?php if (!empty($productos)): ?>
                        <?php foreach ($productos as $p):
                            $imgPortada = !empty($p['imagen_portada']) ? $p['imagen_portada'] : 'no-image.png';
                        ?>
                            <div class="col-sm-6 col-lg-4 producto-card-wrapper">
                                <div class="card bg-dark text-white border-secondary h-100 product-card position-relative">

                                    <?php if ($p['stock'] <= 3 && $p['stock'] > 0): ?>
                                        <div class="badge bg-warning text-dark position-absolute mt-3 ms-3">ÚLTIMAS UNIDADES</div>
                                    <?php endif; ?>

                                    <img src="img/<?= htmlspecialchars($imgPortada) ?>"
                                         class="card-img-top p-3"
                                         alt="<?= htmlspecialchars($p['nombre']) ?>"
                                         onerror="this.src='img/no-image.png'">

                                    <div class="card-body d-flex flex-column text-center">
                                        <span class="badge bg-secondary mb-2 align-self-center small text-uppercase">
                                            <?= htmlspecialchars($p['categoria'] ?? '') ?>
                                        </span>
                                        <h6 class="fw-bold text-uppercase mb-2 nombre-producto">
                                            <?= htmlspecialchars($p['nombre']) ?>
                                        </h6>
                                        <p class="small text-secondary">
                                            <?= htmlspecialchars($p['tallas'] ?? '') ?>
                                        </p>
                                        <p class="h6 text-info mb-3">
                                            COP <?= number_format($p['precio'], 0, ',', '.') ?>
                                        </p>

                                        <?php if ($p['stock'] > 0): ?>
                                            <button class="btn btn-light btn-pill w-100 fw-bold mt-auto"
                                                onclick="agregarAlCarrito(
                                                    '<?= htmlspecialchars($p['nombre'], ENT_QUOTES) ?>',
                                                    <?= $p['precio'] ?>,
                                                    'img/<?= htmlspecialchars($imgPortada) ?>')">
                                                AÑADIR
                                            </button>
                                        <?php else: ?>
                                            <button class="btn btn-danger btn-pill w-100 fw-bold mt-auto" disabled>AGOTADO</button>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="col-12 text-center py-5">
                            <p class="text-secondary">No se encontraron productos en esta categoría.</p>
                        </div>
                    <?php endif; ?>

                </div>
            </section>

        </div>
    </main>

    <!-- Modal Carrito -->
    <div class="modal fade text-dark" id="modalCarrito" tabindex="-1">
        <div class="modal-dialog modal-md modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">RESUMEN DE COMPRA</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <ul id="lista-carrito" class="list-group list-group-flush"></ul>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold fs-5">
                        <span>TOTAL A PAGAR:</span>
                        <span id="total-precio">COP 0</span>
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button class="btn btn-success w-100 fw-bold py-3" onclick="enviarPedido()">
                        <i class="bi bi-whatsapp me-2"></i>PEDIR POR WHATSAPP
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/shop-filters.js"></script>
</body>
</html>
