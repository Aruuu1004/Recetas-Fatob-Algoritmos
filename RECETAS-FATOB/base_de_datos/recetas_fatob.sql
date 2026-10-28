
CREATE DATABASE IF NOT EXISTS recetas_fatob
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recetas_fatob;


CREATE TABLE IF NOT EXISTS ROLES (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    acceso_datos_sensibles BOOLEAN DEFAULT FALSE,
    descripcion VARCHAR(255)
);

INSERT IGNORE INTO ROLES (id_rol, nombre, acceso_datos_sensibles, descripcion) VALUES
(1, 'Administrador', TRUE,  'Control total del sistema'),
(2, 'Usuario',       FALSE, 'Usuario final registrado');

CREATE TABLE IF NOT EXISTS USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL DEFAULT 2,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default_avatar.png',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES ROLES(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS RESTRICCION_DIETARIA (
    id_restriccion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50)
);

INSERT IGNORE INTO RESTRICCION_DIETARIA (id_restriccion, nombre, tipo) VALUES
(1, 'Celiaco', 'Alergia'),
(2, 'Intolerante a la Lactosa', 'Intolerancia'),
(3, 'Vegano', 'Dieta'),
(4, 'Vegetariano', 'Dieta');

CREATE TABLE IF NOT EXISTS USUARIO_RESTRICCION (
    id_usuario INT NOT NULL,
    id_restriccion INT NOT NULL,
    PRIMARY KEY (id_usuario, id_restriccion),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_restriccion) REFERENCES RESTRICCION_DIETARIA(id_restriccion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CATEGORIA (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO CATEGORIA (id_categoria, nombre) VALUES
(1, 'Comidas principales'),
(2, 'Postres'),
(3, 'Desayunos y meriendas'),
(4, 'Entradas y picadas'),
(5, 'Comidas saludables');

CREATE TABLE IF NOT EXISTS RECETA (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    ingredientes TEXT NOT NULL,
    instrucciones TEXT NOT NULL,
    tiempo_preparacion INT NOT NULL DEFAULT 0,
    imagen VARCHAR(255) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_receta_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS COMENTARIO (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_usuario INT NOT NULL,
    texto VARCHAR(1000) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CALIFICACION (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_usuario INT NOT NULL,
    puntuacion TINYINT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_receta_usuario (id_receta, id_usuario),
    CONSTRAINT chk_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seguidores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seguidor_id INT NOT NULL,
    seguido_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (seguidor_id, seguido_id),
    CONSTRAINT chk_no_autoseguir CHECK (seguidor_id <> seguido_id),
    FOREIGN KEY (seguidor_id) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (seguido_id) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FAVORITO (
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_receta),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS RECETA_IMAGEN (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    archivo VARCHAR(255) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CODIGO_RECUPERACION (
    id_codigo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    expira DATETIME NOT NULL,
    intentos TINYINT NOT NULL DEFAULT 0,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    creado DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS RECETA_RESTRICCION (
    id_receta INT NOT NULL,
    id_restriccion INT NOT NULL,
    PRIMARY KEY (id_receta, id_restriccion),
    FOREIGN KEY (id_receta) REFERENCES RECETA(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_restriccion) REFERENCES RESTRICCION_DIETARIA(id_restriccion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CATEGORIA_PRODUCTO (
    id_categoria_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria_producto INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    material VARCHAR(100),
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(255) DEFAULT NULL,
    stock INT NOT NULL DEFAULT 100,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT chk_precio CHECK (precio >= 0),
    CONSTRAINT chk_stock CHECK (stock >= 0),
    FOREIGN KEY (id_categoria_producto) REFERENCES CATEGORIA_PRODUCTO(id_categoria_producto) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS CUPON (
    codigo VARCHAR(30) PRIMARY KEY,
    porcentaje TINYINT NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    vence DATE DEFAULT NULL,
    CONSTRAINT chk_porcentaje CHECK (porcentaje BETWEEN 1 AND 100)
);

CREATE TABLE IF NOT EXISTS CARRITO_ITEM (
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_producto),
    CONSTRAINT chk_cantidad_carrito CHECK (cantidad > 0),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PEDIDO (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    metodo_pago ENUM('tarjeta','mercadopago') NOT NULL,
    codigo_cupon VARCHAR(30) DEFAULT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','pagado','cancelado') NOT NULL DEFAULT 'pagado',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (codigo_cupon) REFERENCES CUPON(codigo) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS PEDIDO_ITEM (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    CONSTRAINT chk_cantidad_pedido CHECK (cantidad > 0),
    FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto) ON DELETE RESTRICT
);


CREATE OR REPLACE VIEW VISTA_RECETA_NOTA AS
SELECT r.id_receta, r.titulo,
       COALESCE(ROUND(AVG(c.puntuacion), 1), 0) AS promedio,
       COUNT(c.id_calificacion) AS votos
FROM RECETA r
LEFT JOIN CALIFICACION c ON c.id_receta = r.id_receta
GROUP BY r.id_receta, r.titulo;

CREATE OR REPLACE VIEW VISTA_RECETA_FAVORITOS AS
SELECT r.id_receta, r.titulo, COUNT(f.id_usuario) AS favoritos
FROM RECETA r
LEFT JOIN FAVORITO f ON f.id_receta = r.id_receta
GROUP BY r.id_receta, r.titulo;


INSERT IGNORE INTO CATEGORIA_PRODUCTO (id_categoria_producto, nombre) VALUES
(1, 'Preparación'),
(2, 'Cortes'),
(3, 'Cocción'),
(4, 'Electrodomésticos');

INSERT IGNORE INTO PRODUCTO (id_producto, id_categoria_producto, nombre, descripcion, material, precio, imagen) VALUES
(1, 1, 'Medidor multiusos', 'Jarra medidora con escala en ml, tazas y onzas.', 'Plástico libre de BPA', 5500, 'medidor.svg'),
(2, 1, 'Mortero', 'Mortero de madera para moler especias y hierbas.', 'Madera de olivo', 3000, 'mortero.svg'),
(3, 2, 'Rallador', 'Rallador de acero inoxidable de cuatro caras.', 'Acero inoxidable', 2600, 'rallador.svg'),
(4, 3, 'Cucharón', 'Cucharón de acero con mango largo.', 'Acero inoxidable', 3100, 'cucharon.svg'),
(5, 2, 'Cuchillo', 'Cuchillo de chef de 20 cm, muy filoso.', 'Acero inoxidable', 7000, 'cuchillo.svg'),
(6, 4, 'Batidora de pie', 'Batidora de pie con bowl de 4 litros y 6 velocidades.', 'Metal y plástico', 54000, 'batidora-pie.svg'),
(7, 1, 'Batidor manual', 'Batidor de alambre para claras y masas livianas.', 'Acero inoxidable', 2800, 'batidor.svg'),
(8, 2, 'Tabla de cortar', 'Tabla de madera maciza con canaleta.', 'Madera de acacia', 5600, 'tabla.svg'),
(9, 3, 'Cafetera italiana', 'Cafetera de aluminio para 6 tazas.', 'Aluminio', 14000, 'cafetera.svg'),
(10, 3, 'Wok', 'Wok antiadherente de 32 cm.', 'Acero al carbono', 28000, 'wok.svg'),
(11, 1, 'Palo de amasar', 'Palo de amasar de madera para tartas y pastas.', 'Madera de haya', 4000, 'palo-amasar.svg'),
(12, 4, 'Tostadora', 'Tostadora de 2 ranuras con 6 niveles de tostado.', 'Acero inoxidable', 32000, 'tostadora.svg'),
(13, 4, 'Batidora de mano', 'Batidora de mano con 5 velocidades.', 'Plástico y metal', 22000, 'batidora-mano.svg'),
(14, 3, 'Olla', 'Olla de acero con tapa de vidrio, 24 cm.', 'Acero inoxidable', 36000, 'olla.svg'),
(15, 3, 'Sartén', 'Sartén antiadherente de 26 cm.', 'Aluminio con teflón', 7000, 'sarten.svg'),
(16, 2, 'Kit de cuchillos', 'Set de 5 cuchillos con taco de madera.', 'Acero inoxidable', 45000, 'kit-cuchillos.svg'),
(17, 1, 'Bowl', 'Bowl de acero inoxidable de 3 litros.', 'Acero inoxidable', 9200, 'bowl.svg'),
(18, 2, 'Pelador', 'Pelador con hoja giratoria.', 'Acero y plástico', 4000, 'pelador.svg'),
(19, 1, 'Colador', 'Colador de malla fina con mango.', 'Acero inoxidable', 3600, 'colador.svg'),
(20, 1, 'Pincel de silicona', 'Pincel de cocina resistente al calor.', 'Silicona', 2000, 'pincel.svg');

INSERT IGNORE INTO CUPON (codigo, porcentaje) VALUES
('FATOB10', 10),
('COCINA20', 20);

