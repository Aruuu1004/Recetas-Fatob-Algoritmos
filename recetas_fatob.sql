
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
    imagen VARCHAR(500) DEFAULT NULL,
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
(1, 1, 'Medidor multiusos', 'Jarra medidora con escala en ml, tazas y onzas.', 'Plástico libre de BPA', 5500, 'Medidor multiusos.jpg'),
(2, 1, 'Mortero', 'Mortero de madera para moler especias y hierbas.', 'Madera de olivo', 3000, 'Mortero.jpg'),
(3, 2, 'Rallador', 'Rallador de acero inoxidable de cuatro caras.', 'Acero inoxidable', 2600, 'Rallador.jpg'),
(4, 3, 'Cucharón', 'Cucharón de acero con mango largo.', 'Acero inoxidable', 3100, 'Cucharon.jpg'),
(5, 2, 'Cuchillo', 'Cuchillo de chef de 20 cm, muy filoso.', 'Acero inoxidable', 7000, 'Cuchillo.jpg'),
(6, 4, 'Batidora de pie', 'Batidora de pie con bowl de 4 litros y 6 velocidades.', 'Metal y plástico', 54000, 'Batidora Electrica.jpg'),
(7, 1, 'Batidor manual', 'Batidor de alambre para claras y masas livianas.', 'Acero inoxidable', 2800, 'Batidora manual.jpg'),
(8, 2, 'Tabla de cortar', 'Tabla de madera maciza con canaleta.', 'Madera de acacia', 5600, 'Tabla madera cortar.jpg'),
(9, 3, 'Cafetera italiana', 'Cafetera de aluminio para 6 tazas.', 'Aluminio', 14000, 'Cafetera.jpg'),
(10, 3, 'Wok', 'Wok antiadherente de 32 cm.', 'Acero al carbono', 28000, 'Wok.webp'),
(11, 1, 'Palo de amasar', 'Palo de amasar de madera para tartas y pastas.', 'Madera de haya', 4000, 'Rodillo.jpg'),
(12, 4, 'Tostadora', 'Tostadora de 2 ranuras con 6 niveles de tostado.', 'Acero inoxidable', 32000, 'Tostadora.jpg'),
(13, 4, 'Batidora de mano', 'Batidora de mano con 5 velocidades.', 'Plástico y metal', 22000, 'Batidora.jpg'),
(14, 3, 'Olla', 'Olla de acero con tapa de vidrio, 24 cm.', 'Acero inoxidable', 36000, 'Olla.jpg'),
(15, 3, 'Sartén', 'Sartén antiadherente de 26 cm.', 'Aluminio con teflón', 7000, 'Sarten.jpg'),
(16, 2, 'Kit de cuchillos', 'Set de 5 cuchillos con taco de madera.', 'Acero inoxidable', 45000, 'Kit cuchillos.jpg'),
(17, 1, 'Bowl', 'Bowl de acero inoxidable de 3 litros.', 'Acero inoxidable', 9200, 'Bowl.jpg'),
(18, 2, 'Pelador', 'Pelador con hoja giratoria.', 'Acero y plástico', 4000, 'Pelador.jpg'),
(19, 1, 'Colador', 'Colador de malla fina con mango.', 'Acero inoxidable', 3600, 'Colador.jpg'),
(20, 1, 'Pincel de silicona', 'Pincel de cocina resistente al calor.', 'Silicona', 2000, 'Pincel silicona.jpg');

INSERT IGNORE INTO CUPON (codigo, porcentaje) VALUES
('FATOB10', 10),
('COCINA20', 20);

ALTER TABLE RECETA MODIFY imagen VARCHAR(500) DEFAULT NULL;

-- @@SEMILLA@@
INSERT IGNORE INTO USUARIO (id_rol, nombre, email, contrasena) VALUES (2, 'Equipo FATOB', 'equipo@recetasfatob.local', '!sin-acceso');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 1, 'Milanesas de carne con puré', 'Las clásicas milanesas crocantes con un puré de papas bien cremoso. Un infaltable de domingo.',
'4 bifes finos de nalga o peceto
2 huevos
1 taza de pan rallado
1 diente de ajo picado
2 cucharadas de perejil picado
1 kg de papas
50 g de manteca
1/2 taza de leche
Sal y pimienta
Aceite para freír',
'Preparar el batido: Batí los huevos con el ajo, el perejil, sal y pimienta.
Empanar: Pasá cada bife por el huevo y después por el pan rallado, presionando bien.
Freír: Calentá aceite en una sartén y dorá las milanesas 3 minutos de cada lado. Escurrilas sobre papel absorbente.
Hacer el puré: Herví las papas peladas hasta que estén tiernas, pisalas y mezclalas con la manteca y la leche tibia.
Servir: Acompañá las milanesas con el puré bien caliente y un chorrito de limón.',
45, 'ejemplo_milanesas.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Milanesas de carne con puré');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 4, 'Empanadas de carne al horno', 'Empanadas jugosas con relleno de carne cortada a cuchillo, cebolla de verdeo y comino.',
'12 tapas de empanada para horno
500 g de carne picada
3 cebollas de verdeo
1 cebolla
2 huevos duros
1 cucharadita de comino
1 cucharadita de pimentón
Aceitunas verdes
Sal y pimienta
1 huevo para pincelar',
'Sofreír: Rehogá la cebolla y el verdeo picados en un poco de aceite hasta que estén transparentes.
Cocinar la carne: Agregá la carne, el comino, el pimentón, sal y pimienta. Cociná 8 minutos y dejá enfriar.
Armar el relleno: Sumá los huevos duros picados y las aceitunas.
Rellenar: Poné una cucharada de relleno en cada tapa y cerrá con el repulgue.
Hornear: Pincelá con huevo batido y horneá a 200 °C por 20 minutos, hasta que estén doradas.',
60, 'ejemplo_empanadas.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Empanadas de carne al horno');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 1, 'Tallarines con salsa de tomate casera', 'Una salsa simple de tomates frescos, ajo y albahaca que le da vida a cualquier pasta.',
'500 g de tallarines
6 tomates maduros
2 dientes de ajo
1 cebolla
3 cucharadas de aceite de oliva
Albahaca fresca
1 cucharadita de azúcar
Sal y pimienta
Queso rallado',
'Preparar los tomates: Hacé un corte en cruz a cada tomate, escaldalos 1 minuto, pelalos y picalos.
Hacer la salsa: Rehogá la cebolla y el ajo en aceite, sumá los tomates, el azúcar, sal y pimienta. Cociná 20 minutos a fuego bajo.
Cocinar la pasta: Herví los tallarines en agua con sal hasta que estén al dente.
Mezclar: Combiná la pasta con la salsa y terminá con albahaca fresca y queso rallado.',
35, 'ejemplo_tallarines.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Tallarines con salsa de tomate casera');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 5, 'Tarta de zapallitos y queso', 'Una tarta liviana y casera, ideal para llevar al trabajo o compartir en una cena.',
'2 tapas de tarta
4 zapallitos verdes
1 cebolla
3 huevos
200 g de queso cremoso
1/2 taza de crema de leche
Nuez moscada
Sal y pimienta',
'Cocinar el relleno: Salteá la cebolla y los zapallitos en rodajas hasta que se ablanden y largá el exceso de agua.
Preparar la mezcla: Batí los huevos con la crema, la nuez moscada, sal y pimienta.
Armar: Forrá un molde con una tapa, poné los zapallitos, el queso en cubos y volcá la mezcla. Tapá con la otra masa y sellá los bordes.
Hornear: Cociná a 190 °C durante 35 minutos, hasta que esté bien dorada.',
50, 'ejemplo_tarta.avif'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Tarta de zapallitos y queso');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 2, 'Flan casero con dulce de leche', 'El postre argentino por excelencia: flan cremoso con caramelo y una buena cucharada de dulce de leche.',
'1 litro de leche
6 huevos
1 taza de azúcar
1 cucharadita de esencia de vainilla
1 taza de azúcar para el caramelo
Dulce de leche para servir
Crema batida',
'Hacer el caramelo: Derretí el azúcar en una flanera a fuego medio hasta que tome color ámbar y cubrí el fondo.
Preparar la mezcla: Batí los huevos con el azúcar, sumá la leche y la vainilla y colá.
Cocinar: Volcá en la flanera y cociná a baño María en horno a 170 °C por 50 minutos.
Enfriar: Dejá entibiar y llevá a la heladera al menos 4 horas.
Servir: Desmoldá y acompañá con dulce de leche y crema batida.',
70, 'ejemplo_flan.avif'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Flan casero con dulce de leche');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 3, 'Tostadas con palta y huevo', 'Un desayuno rápido, nutritivo y con mucho sabor. Listo en diez minutos.',
'4 rebanadas de pan de masa madre
2 paltas maduras
4 huevos
1 limón
Semillas de sésamo
Sal y pimienta
Un chorrito de aceite de oliva',
'Tostar: Tostá el pan hasta que quede crocante.
Pisar la palta: Pisá las paltas con jugo de limón, sal y pimienta.
Cocinar los huevos: Hacelos fritos o poché, como más te gusten.
Armar: Untá la palta sobre las tostadas, apoyá el huevo y terminá con sésamo y aceite de oliva.',
10, 'ejemplo_tostadas.avif'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Tostadas con palta y huevo');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 2, 'Brownie de chocolate', 'Húmedo por dentro, con una costra crocante por fuera. Para los que aman el chocolate.',
'200 g de chocolate semiamargo
150 g de manteca
1 taza de azúcar
3 huevos
1 taza de harina
1/2 taza de nueces picadas
1 pizca de sal',
'Derretir: Fundí el chocolate con la manteca a baño María y dejá entibiar.
Mezclar: Agregá el azúcar y los huevos de a uno, batiendo bien.
Incorporar: Sumá la harina con la sal en forma envolvente y las nueces.
Hornear: Volcá en un molde enmantecado y horneá a 180 °C por 25 minutos. Dejá enfriar antes de cortar.',
40, 'ejemplo_brownie.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Brownie de chocolate');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 5, 'Ensalada tibia de lentejas', 'Una ensalada completa y reconfortante, con proteínas vegetales y mucho color.',
'2 tazas de lentejas cocidas
1 zanahoria rallada
1 morrón rojo
1/2 cebolla morada
Perejil fresco
3 cucharadas de aceite de oliva
1 cucharada de vinagre de manzana
Sal y pimienta',
'Preparar las verduras: Cortá el morrón y la cebolla en cubitos y rallá la zanahoria.
Aderezar: Mezclá el aceite, el vinagre, sal y pimienta.
Combinar: Juntá las lentejas tibias con las verduras y el aderezo.
Servir: Terminá con perejil picado y comela tibia o fría.',
25, 'ejemplo_lentejas.avif'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Ensalada tibia de lentejas');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 4, 'Provoleta a la parrilla', 'Queso fundido, crocante por fuera y cremoso por dentro. La entrada perfecta antes del asado.',
'2 provoletas de 200 g
Orégano
Ají molido
1 cucharada de aceite de oliva
1 tomate en rodajas
Pan para acompañar',
'Preparar: Poné las provoletas sobre la parrilla bien caliente o en una sartén de hierro.
Dorar: Cociná 3 minutos por lado hasta que se forme una costra dorada.
Condimentar: Espolvoreá con orégano y ají molido y sumá un hilo de aceite.
Servir: Llevá a la mesa de inmediato, con tomate y pan.',
15, 'ejemplo_provoleta.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Provoleta a la parrilla');

INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
SELECT u.id_usuario, 3, 'Panqueques con dulce de leche', 'Finitos, suaves y rellenos de dulce de leche. Perfectos para la merienda.',
'2 huevos
1 taza de harina
1 1/2 tazas de leche
1 cucharada de manteca derretida
1 pizca de sal
Dulce de leche repostero
Manteca para la sartén',
'Hacer la masa: Batí los huevos con la leche, la manteca y la sal, e incorporá la harina hasta que no queden grumos.
Descansar: Dejá reposar la mezcla 15 minutos.
Cocinar: Volcá un cucharón en una sartén enmantecada y cociná 1 minuto por lado.
Rellenar: Untá cada panqueque con dulce de leche y doblalo en cuatro.',
25, 'ejemplo_panqueques.jpg'
FROM USUARIO u WHERE u.email = 'equipo@recetasfatob.local'
AND NOT EXISTS (SELECT 1 FROM RECETA WHERE titulo = 'Panqueques con dulce de leche');


