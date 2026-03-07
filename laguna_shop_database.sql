-- ============================================================
--  LAGUNA'S BARBER & SHOP — Base de Datos Segura
--  Versión: 2.0
--  Motor: MySQL / MariaDB (XAMPP)
--  Charset: utf8mb4 (soporte emojis y tildes)
-- ============================================================

-- Crear y seleccionar la base de datos
DROP DATABASE IF EXISTS laguna_shop;
CREATE DATABASE laguna_shop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE laguna_shop;

-- ============================================================
-- TABLA 1: administradores
-- Almacena los usuarios del panel de control.
-- La contraseña se guarda con hash bcrypt (password_hash).
-- NUNCA se guarda en texto plano.
-- ============================================================
CREATE TABLE administradores (
    id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    usuario       VARCHAR(60)      NOT NULL UNIQUE,
    password_hash VARCHAR(255)     NOT NULL COMMENT 'bcrypt hash — NUNCA texto plano',
    nombre        VARCHAR(100)     NOT NULL DEFAULT '',
    activo        TINYINT(1)       NOT NULL DEFAULT 1  COMMENT '1=activo, 0=bloqueado',
    ultimo_acceso DATETIME                  DEFAULT NULL,
    creado_en     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 2: categorias
-- Catálogo de categorías de productos (Camisas, Gorras, etc.)
-- ============================================================
CREATE TABLE categorias (
    id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nombre    VARCHAR(80)   NOT NULL UNIQUE,
    seccion   ENUM('ropa','cosmetico') NOT NULL COMMENT 'Sección de la tienda',
    activa    TINYINT(1)    NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_seccion (seccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 3: productos
-- Catálogo principal de productos de la tienda.
-- ============================================================
CREATE TABLE productos (
    id              INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)       NOT NULL,
    seccion         ENUM('ropa','cosmetico') NOT NULL,
    id_categoria    INT UNSIGNED                DEFAULT NULL,
    precio          DECIMAL(12,2)      NOT NULL CHECK (precio >= 0),
    precio_anterior DECIMAL(12,2)               DEFAULT NULL COMMENT 'Precio antes de la oferta',
    en_oferta       TINYINT(1)         NOT NULL DEFAULT 0,
    stock           SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
    tallas          VARCHAR(100)                DEFAULT NULL COMMENT 'S,M,L,XL separados por coma',
    colores         VARCHAR(200)                DEFAULT NULL COMMENT 'negro,blanco,#ff0033 separados por coma',
    descripcion     TEXT                        DEFAULT NULL,
    activo          TINYINT(1)         NOT NULL DEFAULT 1,
    creado_en       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_seccion   (seccion),
    INDEX idx_categoria (id_categoria),
    INDEX idx_oferta    (en_oferta),
    INDEX idx_stock     (stock),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 4: producto_imagenes
-- Imágenes de cada producto (relación 1:N).
-- Antes estaban en un campo CSV — ahora cada imagen es una fila.
-- ============================================================
CREATE TABLE producto_imagenes (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_producto INT UNSIGNED  NOT NULL,
    nombre_archivo VARCHAR(200) NOT NULL COMMENT 'nombre del archivo en /img/',
    es_portada  TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 = imagen principal',
    orden       TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_producto (id_producto),
    CONSTRAINT fk_imagenes_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 5: pedidos
-- Registro de pedidos enviados por WhatsApp.
-- Permite llevar historial de ventas.
-- ============================================================
CREATE TABLE pedidos (
    id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(20)    NOT NULL UNIQUE COMMENT 'Código legible: LAG-20250001',
    nombre_cliente  VARCHAR(120)            DEFAULT NULL,
    telefono        VARCHAR(20)             DEFAULT NULL,
    estado          ENUM('pendiente','confirmado','enviado','entregado','cancelado')
                                   NOT NULL DEFAULT 'pendiente',
    total           DECIMAL(14,2)  NOT NULL DEFAULT 0,
    notas           TEXT                    DEFAULT NULL,
    creado_en       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_estado    (estado),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 6: pedido_items
-- Líneas de cada pedido (qué productos y cuántos).
-- ============================================================
CREATE TABLE pedido_items (
    id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    id_pedido   INT UNSIGNED     NOT NULL,
    id_producto INT UNSIGNED              DEFAULT NULL,
    nombre      VARCHAR(150)     NOT NULL COMMENT 'Snapshot del nombre al momento de comprar',
    talla       VARCHAR(20)               DEFAULT NULL,
    color       VARCHAR(50)               DEFAULT NULL,
    precio_unit DECIMAL(12,2)    NOT NULL,
    cantidad    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    subtotal    DECIMAL(14,2)    NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_pedido  (id_pedido),
    CONSTRAINT fk_items_pedido
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA 7: log_accesos
-- Auditoría de inicios de sesión del panel admin.
-- Permite detectar intentos de hackeo (brute force).
-- ============================================================
CREATE TABLE log_accesos (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario     VARCHAR(60)   NOT NULL,
    ip          VARCHAR(45)   NOT NULL COMMENT 'Soporta IPv4 e IPv6',
    exitoso     TINYINT(1)    NOT NULL DEFAULT 0,
    user_agent  VARCHAR(300)           DEFAULT NULL,
    intentado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_usuario (usuario),
    INDEX idx_ip      (ip),
    INDEX idx_fecha   (intentado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- ► Admin por defecto: usuario = admin | contraseña = Admin2025!
--   Hash generado con: password_hash('Admin2025!', PASSWORD_BCRYPT)
--   ¡CAMBIA LA CONTRASEÑA INMEDIATAMENTE DESPUÉS DE INSTALAR!
INSERT INTO administradores (usuario, password_hash, nombre) VALUES
('admin', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal');

-- Categorías de ejemplo
INSERT INTO categorias (nombre, seccion) VALUES
('Camisas',          'ropa'),
('Bermudas',         'ropa'),
('Gorras',           'ropa'),
('Accesorios',       'ropa'),
('Shampoo',          'cosmetico'),
('Ceras y Pomadas',  'cosmetico'),
('Aceites de Barba', 'cosmetico'),
('Colonias',         'cosmetico');


-- ============================================================
-- VISTA ÚTIL: productos con imagen de portada
-- Facilita las consultas en el panel y la tienda.
-- ============================================================
CREATE OR REPLACE VIEW v_productos_portada AS
SELECT
    p.id,
    p.nombre,
    p.seccion,
    c.nombre          AS categoria,
    p.precio,
    p.precio_anterior,
    p.en_oferta,
    p.stock,
    p.tallas,
    p.colores,
    p.descripcion,
    p.activo,
    pi.nombre_archivo AS imagen_portada
FROM productos p
LEFT JOIN categorias c         ON p.id_categoria = c.id
LEFT JOIN producto_imagenes pi ON pi.id_producto = p.id AND pi.es_portada = 1;


-- ============================================================
-- PROCEDIMIENTO: registrar acceso fallido / exitoso
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_log_acceso(
    IN p_usuario   VARCHAR(60),
    IN p_ip        VARCHAR(45),
    IN p_exitoso   TINYINT,
    IN p_ua        VARCHAR(300)
)
BEGIN
    INSERT INTO log_accesos (usuario, ip, exitoso, user_agent)
    VALUES (p_usuario, p_ip, p_exitoso, p_ua);
END$$

DELIMITER ;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
