<?php
include("config/conexion.php");

$stmt = $db->prepare(
    "SELECT p.*, pi.nombre_archivo AS imagen_portada, pi.color AS color_portada,
            c.nombre AS categoria
     FROM productos p
     LEFT JOIN producto_imagenes pi ON pi.id_producto = p.id AND pi.es_portada = 1
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE p.seccion = 'ropa' AND p.activo = 1
     ORDER BY p.en_oferta DESC, p.id DESC"
);
$stmt->execute();
$productos = $stmt->fetchAll();

$stmtCats = $db->prepare("SELECT DISTINCT nombre FROM categorias WHERE seccion = 'ropa' ORDER BY nombre");
$stmtCats->execute();
$categorias = $stmtCats->fetchAll();

$stmtImgs = $db->prepare(
    "SELECT nombre_archivo, color, es_portada, orden
     FROM producto_imagenes
     WHERE id_producto = ?
     ORDER BY es_portada DESC, orden ASC"
);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Premium | Laguna's Barber &amp; Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
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
        <h1 class="display-3 fw-bold main-title">LAGUNA'S SHOP</h1>
        <p class="text-secondary text-uppercase" style="letter-spacing:3px">Streetwear &amp; Premium Essentials</p>
    </header>

    <main class="container-fluid px-lg-5 pb-5">
        <div class="row">

            <!-- Sidebar -->
            <aside class="col-lg-3 mb-4">
                <div class="sticky-top" style="top:90px; z-index:10">
                    <h5 class="fw-bold mb-3" style="font-family:'Bebas Neue'; color:#aaa">CATEGORÍAS</h5>
                    <div class="list-group list-group-flush custom-sidebar mb-4" id="sidebar-categorias">
                        <button onclick="filtrarCategoria('todas', this)" class="list-group-item list-group-item-action active">
                            TODO EL SHOP
                        </button>
                        <?php foreach ($categorias as $cat): ?>
                            <button onclick="filtrarCategoria('<?= htmlspecialchars($cat['nombre'], ENT_QUOTES) ?>', this)"
                                class="list-group-item list-group-item-action">
                                <?= strtoupper(htmlspecialchars($cat['nombre'])) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                    <h5 class="fw-bold mb-3" style="font-family:'Bebas Neue'; color:#aaa">BÚSQUEDA RÁPIDA</h5>
                    <input type="text" id="buscador"
                        class="form-control bg-dark text-white border-secondary mb-3"
                        placeholder="Ej: Camisa negra...">
                </div>
            </aside>

            <!-- Productos -->
            <section class="col-lg-9">
                <div class="row g-4" id="contenedor-ropa">

                    <?php
                    $contador = 1;
                    foreach ($productos as $producto):

                        $stmtImgs->execute([$producto['id']]);
                        $todasImagenes = $stmtImgs->fetchAll();

                        $imagenPrincipal = !empty($producto['imagen_portada'])
                            ? $producto['imagen_portada']
                            : (!empty($todasImagenes[0]['nombre_archivo']) ? $todasImagenes[0]['nombre_archivo'] : 'no-image.png');

                        $tallas  = !empty($producto['tallas'])  ? array_map('trim', explode(',', $producto['tallas']))  : [];
                        $colores = !empty($producto['colores']) ? array_map('trim', explode(',', $producto['colores'])) : [];

                        $imgsPorColor = [];
                        foreach ($todasImagenes as $imgRow) {
                            if (!empty($imgRow['color'])) {
                                $colorKey = strtolower(trim($imgRow['color']));
                                if (!isset($imgsPorColor[$colorKey])) {
                                    $imgsPorColor[$colorKey] = 'img/' . $imgRow['nombre_archivo'];
                                }
                            }
                        }
                        $imgsPorColorJson = json_encode($imgsPorColor, JSON_UNESCAPED_UNICODE);

                        $precioFinal = ($producto['en_oferta'] == 1 && $producto['precio_anterior'] > 0)
                            ? $producto['precio_anterior']
                            : $producto['precio'];
                    ?>

                        <div class="col-sm-6 col-lg-4 producto-item"
                            data-categoria="<?= htmlspecialchars($producto['categoria'] ?? '') ?>"
                            data-nombre="<?= htmlspecialchars($producto['nombre']) ?>">

                            <div class="card bg-dark text-white border-secondary h-100 product-card">

                                <?php if ($producto['en_oferta'] == 1): ?>
                                    <div class="badge-oferta">OFERTA</div>
                                <?php endif; ?>

                                <!-- Imagen con zoom -->
                                <div class="zoom-container" onmousemove="zoomMover(event)" onmouseleave="zoomReset(event)">
                                    <img src="img/<?= htmlspecialchars($imagenPrincipal) ?>"
                                        id="main-img-<?= $contador ?>"
                                        class="card-img-top zoom-img"
                                        alt="<?= htmlspecialchars($producto['nombre']) ?>"
                                        onerror="this.src='img/no-image.png'">
                                </div>

                                <!-- Miniaturas -->
                                <?php if (count($todasImagenes) > 1): ?>
                                    <div class="d-flex gap-1 mt-2 px-2 pb-1 overflow-auto">
                                        <?php foreach ($todasImagenes as $idx => $imgRow): ?>
                                            <img src="img/<?= htmlspecialchars($imgRow['nombre_archivo']) ?>"
                                                data-src="img/<?= htmlspecialchars($imgRow['nombre_archivo']) ?>"
                                                class="img-thumbnail thumb-mini <?= $idx === 0 ? 'active border-white' : '' ?>"
                                                data-color="<?= strtolower(trim($imgRow['color'] ?? '')) ?>"
                                                title="<?= htmlspecialchars($imgRow['color'] ?? '') ?>"
                                                onclick="cambiarImagen(<?= $contador ?>, 'img/<?= htmlspecialchars($imgRow['nombre_archivo']) ?>', this)"
                                                style="width:48px;height:48px;object-fit:cover;cursor:pointer;">
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>

                                <!-- Card body -->
                                <div class="card-body d-flex flex-column p-3">
                                    <span class="badge bg-secondary mb-2 align-self-start" style="font-size:0.65rem;">
                                        <?= strtoupper(htmlspecialchars($producto['categoria'] ?? '')) ?>
                                    </span>
                                    <h6 class="fw-bold text-uppercase mb-2" style="font-size:0.9rem; min-height:40px;">
                                        <?= htmlspecialchars($producto['nombre']) ?>
                                    </h6>

                                    <!-- Precios -->
                                    <div class="mb-3">
                                        <?php if ($producto['en_oferta'] == 1 && $producto['precio_anterior'] > 0): ?>
                                            <p class="precio-original small mb-0">COP <?= number_format($producto['precio'], 0, ',', '.') ?></p>
                                            <p class="h6 text-danger fw-bold mb-0">COP <?= number_format($producto['precio_anterior'], 0, ',', '.') ?></p>
                                        <?php else: ?>
                                            <p class="h6 text-info mb-0">COP <?= number_format($producto['precio'], 0, ',', '.') ?></p>
                                        <?php endif; ?>
                                    </div>

                                    <div class="mt-auto">
                                        <!-- Bolitas de color -->
                                        <?php if (!empty($colores)): ?>
                                            <p class="small mb-1 text-secondary fw-bold">
                                                COLOR: <span id="color-label-<?= $contador ?>" class="text-white"><?= strtoupper(htmlspecialchars($colores[0])) ?></span>
                                            </p>
                                            <div class="color-swatch-group" id="swatches-<?= $contador ?>">
                                                <?php foreach ($colores as $idx => $color):
                                                    $colorCss = 'bg-' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $color));
                                                    $esHex    = str_starts_with(trim($color), '#');
                                                    $styleHex = $esHex ? 'style="background-color:' . htmlspecialchars(trim($color)) . '"' : '';
                                                ?>
                                                    <div class="color-circle <?= !$esHex ? $colorCss : '' ?> <?= $idx === 0 ? 'active' : '' ?>"
                                                        <?= $styleHex ?>
                                                        title="<?= htmlspecialchars($color) ?>"
                                                        data-color="<?= strtolower(trim($color)) ?>"
                                                        onclick="seleccionarColorSwatch(this, '<?= strtolower(trim($color)) ?>', 'color-input-<?= $contador ?>', null, <?= $contador ?>)" 'color-input-<?= $contador ?>' , <?= $imgsPorColorJson ?>, <?= $contador ?>)">
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                            <input type="hidden" id="color-input-<?= $contador ?>" value="<?= htmlspecialchars(strtolower($colores[0])) ?>">
                                        <?php endif; ?>

                                        <!-- Tallas -->
                                        <?php if (!empty($tallas)): ?>
                                            <select class="form-select form-select-sm bg-black text-white border-secondary mb-3"
                                                id="talla-<?= $contador ?>">
                                                <?php foreach ($tallas as $talla): ?>
                                                    <option value="<?= htmlspecialchars(trim($talla)) ?>"><?= htmlspecialchars(trim($talla)) ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                        <?php endif; ?>

                                        <!-- Botón agregar -->
                                        <button class="btn btn-light btn-pill w-100 fw-bold btn-sm"
                                            onclick="agregarRopaAlCarrito(
                                            '<?= htmlspecialchars($producto['nombre'], ENT_QUOTES) ?>',
                                            <?= $precioFinal ?>,
                                            'talla-<?= $contador ?>',
                                            'color-input-<?= $contador ?>')">
                                            <i class="bi bi-plus-lg me-1"></i>AÑADIR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    <?php $contador++;
                    endforeach; ?>

                    <?php if (empty($productos)): ?>
                        <div class="col-12 text-center py-5">
                            <p class="text-secondary">No hay productos de ropa disponibles aún.</p>
                        </div>
                    <?php endif; ?>

                </div>
            </section>
        </div>
    </main>

    <!-- Modal Carrito -->
    <div class="modal fade" id="modalCarrito" tabindex="-1">
        <div class="modal-dialog modal-md modal-dialog-centered">
            <div class="modal-content bg-white text-dark">
                <div class="modal-header border-bottom-0">
                    <h5 class="modal-title fw-bold" style="font-family:'Bebas Neue'; font-size:1.5rem">Resumen de Compra</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-0">
                    <ul id="lista-carrito" class="list-group list-group-flush"></ul>
                    <div class="p-3 bg-light">
                        <div class="d-flex justify-content-between fw-bold fs-5">
                            <span>TOTAL A PAGAR:</span>
                            <span id="total-precio" class="text-success">COP 0</span>
                        </div>
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
    <script src="js/cart-ropa.js"></script>
    <script src="js/shop-filters.js"></script>
</body>

</html>