<?php

require __DIR__ . '/conexion.php';

$accion = isset($_GET['accion']) ? $_GET['accion'] : '';

if ($accion === 'estado') responder(armarEstado());
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fallo('Método no permitido.', 405);

$acciones = [
    'login'              => 'accionLogin',
    'logout'             => 'accionLogout',
    'registro'           => 'accionRegistro',
    'recuperar_buscar'   => 'accionRecuperarBuscar',
    'recuperar_clave'    => 'accionRecuperarClave',
    'perfil_guardar'     => 'accionPerfilGuardar',
    'usuario_guardar'    => 'accionUsuarioGuardar',
    'usuario_eliminar'   => 'accionUsuarioEliminar',
    'receta_guardar'     => 'accionRecetaGuardar',
    'receta_eliminar'    => 'accionRecetaEliminar',
    'comentar'           => 'accionComentar',
    'comentario_eliminar'=> 'accionComentarioEliminar',
    'favorito'           => 'accionFavorito',
    'seguir'             => 'accionSeguir',
    'carrito_agregar'    => 'accionCarritoAgregar',
    'carrito_fijar'      => 'accionCarritoFijar',
    'carrito_vaciar'     => 'accionCarritoVaciar',
    'cupon'              => 'accionCupon',
    'pedido_confirmar'   => 'accionPedidoConfirmar',
];
if (!isset($acciones[$accion])) fallo('Acción desconocida.', 404);
call_user_func($acciones[$accion]);
responder(['ok' => true]);


function armarEstado() {
    $pdo = db();
    $yo = usuarioActual();
    $esAdmin = $yo && (int)$yo['id_rol'] === 1;
    $estado = ['sesion' => $yo ? (int)$yo['id_usuario'] : null];

    $estado['usuarios'] = [];
    foreach ($pdo->query('SELECT id_usuario, id_rol, nombre, email, fecha_registro FROM USUARIO ORDER BY id_usuario') as $u) {
        $x = ['id' => (int)$u['id_usuario'], 'rol' => (int)$u['id_rol'], 'nombre' => $u['nombre'], 'fecha' => substr((string)$u['fecha_registro'], 0, 10)];
        if ($esAdmin || ($yo && (int)$yo['id_usuario'] === $x['id'])) $x['email'] = $u['email'];
        $estado['usuarios'][] = $x;
    }

    $estado['recetas'] = [];
    foreach ($pdo->query('SELECT id_receta, id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen, fecha_creacion FROM RECETA ORDER BY id_receta') as $r) {
        $estado['recetas'][] = [
            'id' => (int)$r['id_receta'], 'autor' => (int)$r['id_usuario'], 'cat' => (int)$r['id_categoria'],
            'titulo' => $r['titulo'], 'desc' => $r['descripcion'],
            'ingredientes' => lineas($r['ingredientes']), 'pasos' => lineas($r['instrucciones']),
            'tiempo' => (int)$r['tiempo_preparacion'], 'imagen' => $r['imagen'] === null ? '' : $r['imagen'],
            'fecha' => substr((string)$r['fecha_creacion'], 0, 10),
        ];
    }


    $estado['calificaciones'] = [];
    $notas = [];
    foreach ($pdo->query('SELECT id_receta, id_usuario, puntuacion FROM CALIFICACION') as $c) {
        $estado['calificaciones'][] = ['receta' => (int)$c['id_receta'], 'usuario' => (int)$c['id_usuario'], 'nota' => (int)$c['puntuacion']];
        $notas[$c['id_receta'] . '-' . $c['id_usuario']] = (int)$c['puntuacion'];
    }
    $filas = $pdo->query('SELECT id_comentario, id_receta, id_usuario, texto, fecha FROM COMENTARIO ORDER BY id_comentario')->fetchAll();
    $ultimo = [];
    foreach ($filas as $c) $ultimo[$c['id_receta'] . '-' . $c['id_usuario']] = (int)$c['id_comentario'];
    $estado['comentarios'] = [];
    foreach ($filas as $c) {
        $k = $c['id_receta'] . '-' . $c['id_usuario'];
        $estado['comentarios'][] = [
            'id' => (int)$c['id_comentario'], 'receta' => (int)$c['id_receta'], 'usuario' => (int)$c['id_usuario'],
            'texto' => $c['texto'], 'nota' => ($ultimo[$k] === (int)$c['id_comentario'] && isset($notas[$k])) ? $notas[$k] : 0,
            'fecha' => substr((string)$c['fecha'], 0, 10),
        ];
    }

    $estado['favoritos'] = [];
    foreach ($pdo->query('SELECT id_usuario, id_receta FROM FAVORITO') as $f) {
        $estado['favoritos'][] = ['usuario' => (int)$f['id_usuario'], 'receta' => (int)$f['id_receta']];
    }
    $estado['seguidores'] = [];
    foreach ($pdo->query('SELECT seguidor_id, seguido_id FROM seguidores') as $s) {
        $estado['seguidores'][] = ['seguidor' => (int)$s['seguidor_id'], 'seguido' => (int)$s['seguido_id']];
    }

    $estado['productos'] = [];
    foreach ($pdo->query('SELECT p.id_producto, p.nombre, p.descripcion, p.material, p.precio, p.imagen, p.stock, c.nombre AS categoria
                          FROM PRODUCTO p JOIN CATEGORIA_PRODUCTO c ON c.id_categoria_producto = p.id_categoria_producto
                          WHERE p.activo = 1 ORDER BY p.id_producto') as $p) {
        $estado['productos'][] = [
            'id' => (int)$p['id_producto'], 'nombre' => $p['nombre'], 'cat' => $p['categoria'], 'precio' => (float)$p['precio'],
            'imagen' => $p['imagen'] === null ? '' : $p['imagen'], 'desc' => (string)$p['descripcion'],
            'material' => (string)$p['material'], 'stock' => (int)$p['stock'],
        ];
    }
    $estado['carrito'] = carritoItems();

    $estado['cupon'] = null;
    $estado['cupones'] = new stdClass();
    if (!empty($_SESSION['cupon'])) {
        $c = buscarCupon($_SESSION['cupon']);
        if ($c) {
            $estado['cupon'] = $c['codigo'];
            $estado['cupones'] = [$c['codigo'] => (int)$c['porcentaje']];
        } else {
            unset($_SESSION['cupon']);
        }
    }

    $estado['ultimoPedido'] = null;
    if ($yo) {
        $st = $pdo->prepare('SELECT id_pedido, metodo_pago, monto_total FROM PEDIDO WHERE id_usuario = ? ORDER BY id_pedido DESC LIMIT 1');
        $st->execute([(int)$yo['id_usuario']]);
        if ($p = $st->fetch()) {
            $estado['ultimoPedido'] = [
                'id' => (int)$p['id_pedido'],
                'metodo' => $p['metodo_pago'] === 'tarjeta' ? 'Tarjeta' : 'Mercado Pago',
                'monto' => (float)$p['monto_total'],
            ];
        }
    }
    return $estado;
}

function lineas($t) {
    $out = [];
    foreach (preg_split('/\R/u', (string)$t) as $l) {
        $l = trim($l);
        if ($l !== '') $out[] = $l;
    }
    return $out;
}
function listaLineas($v) {
    $out = [];
    if (!is_array($v)) return $out;
    foreach ($v as $l) {
        if (is_string($l) && trim($l) !== '') $out[] = trim($l);
    }
    return $out;
}


function accionLogin() {
    $email = texto('email', 150);
    $clave = claveEntrada('clave');
    if ($email === '' || $clave === '') fallo('Por favor completá todos los campos.');
    $st = db()->prepare('SELECT id_usuario, contrasena FROM USUARIO WHERE email = ?');
    $st->execute([$email]);
    $u = $st->fetch();
    if (!$u || !password_verify($clave, $u['contrasena'])) fallo('Correo electrónico o contraseña incorrectos.', 401);

    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id_usuario'];

    if (!empty($_SESSION['carrito'])) {
        $invitado = $_SESSION['carrito'];
        unset($_SESSION['carrito']);
        $st = db()->prepare('INSERT INTO CARRITO_ITEM (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)
                             ON DUPLICATE KEY UPDATE cantidad = LEAST(99, cantidad + VALUES(cantidad))');
        foreach ($invitado as $idProducto => $cant) {
            if (productoExiste((int)$idProducto)) $st->execute([(int)$u['id_usuario'], (int)$idProducto, (int)$cant]);
        }
    }
}

function accionLogout() {
    $_SESSION = [];
    session_destroy();
}

function accionRegistro() {
    $nombre = texto('nombre', 100);
    $email  = texto('email', 150);
    $clave  = claveEntrada('clave');
    if ($nombre === '' || $email === '' || $clave === '') fallo('Por favor completá todos los campos.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fallo('Ingresá un correo electrónico válido.');
    if (mb_strlen($clave) < 6) fallo('La contraseña debe tener al menos 6 caracteres.');

    $pdo = db();
    $rol = ((int)$pdo->query('SELECT COUNT(*) FROM USUARIO')->fetchColumn() === 0) ? 1 : 2;
    try {
        $st = $pdo->prepare('INSERT INTO USUARIO (id_rol, nombre, email, contrasena) VALUES (?, ?, ?, ?)');
        $st->execute([$rol, $nombre, $email, password_hash($clave, PASSWORD_DEFAULT)]);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000') fallo('Ese correo ya está registrado.');
        throw $e;
    }
}


function accionRecuperarBuscar() {
    $email = texto('email', 150);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fallo('Ingresá un correo electrónico válido.');
    $st = db()->prepare('SELECT id_usuario FROM USUARIO WHERE email = ?');
    $st->execute([$email]);
    if (!$st->fetch()) fallo('No encontramos una cuenta con ese correo.', 404);
}
function accionRecuperarClave() {
    $email = texto('email', 150);
    $clave = claveEntrada('clave');
    if (mb_strlen($clave) < 6) fallo('La contraseña debe tener al menos 6 caracteres.');
    $st = db()->prepare('UPDATE USUARIO SET contrasena = ? WHERE email = ?');
    $st->execute([password_hash($clave, PASSWORD_DEFAULT), $email]);
    if ($st->rowCount() === 0) fallo('No encontramos una cuenta con ese correo.', 404);
}

function accionPerfilGuardar() {
    $yo = exigirLogin();
    $nombre = texto('nombre', 100);
    $email  = texto('email', 150);
    $clave  = claveEntrada('clave');
    if ($nombre === '' || $email === '') fallo('Completá nombre y correo.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fallo('Ingresá un correo electrónico válido.');
    if ($clave !== '' && mb_strlen($clave) < 6) fallo('La contraseña debe tener al menos 6 caracteres.');
    correoLibre($email, (int)$yo['id_usuario']);

    if ($clave !== '') {
        $st = db()->prepare('UPDATE USUARIO SET nombre = ?, email = ?, contrasena = ? WHERE id_usuario = ?');
        $st->execute([$nombre, $email, password_hash($clave, PASSWORD_DEFAULT), (int)$yo['id_usuario']]);
    } else {
        $st = db()->prepare('UPDATE USUARIO SET nombre = ?, email = ? WHERE id_usuario = ?');
        $st->execute([$nombre, $email, (int)$yo['id_usuario']]);
    }
}

function correoLibre($email, $idPropio) {
    $st = db()->prepare('SELECT id_usuario FROM USUARIO WHERE email = ? AND id_usuario <> ?');
    $st->execute([$email, $idPropio]);
    if ($st->fetch()) fallo('Ese correo ya lo usa otra cuenta.');
}


function accionUsuarioGuardar() {
    exigirAdmin();
    $id     = entero('id');
    $nombre = texto('nombre', 100);
    $email  = texto('email', 150);
    $rol    = entero('rol');
    if (!in_array($rol, [1, 2], true)) fallo('Rol inválido.');
    if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) fallo('Revisá el nombre y el correo electrónico.');

    $pdo = db();
    $st = $pdo->prepare('SELECT id_rol FROM USUARIO WHERE id_usuario = ?');
    $st->execute([$id]);
    $actual = $st->fetch();
    if (!$actual) fallo('El usuario no existe.', 404);
    correoLibre($email, $id);

    if ((int)$actual['id_rol'] === 1 && $rol !== 1 && (int)$pdo->query('SELECT COUNT(*) FROM USUARIO WHERE id_rol = 1')->fetchColumn() <= 1) {
        fallo('Tiene que quedar al menos un administrador.');
    }
    $st = $pdo->prepare('UPDATE USUARIO SET nombre = ?, email = ?, id_rol = ? WHERE id_usuario = ?');
    $st->execute([$nombre, $email, $rol, $id]);
}

function accionUsuarioEliminar() {
    $yo = exigirAdmin();
    $id = entero('id');
    if ($id === (int)$yo['id_usuario']) fallo('No podés eliminar tu propia cuenta desde acá.');
    $st = db()->prepare('SELECT imagen FROM RECETA WHERE id_usuario = ?');
    $st->execute([$id]);
    $fotos = $st->fetchAll(PDO::FETCH_COLUMN);
    try {
        $st = db()->prepare('DELETE FROM USUARIO WHERE id_usuario = ?');
        $st->execute([$id]);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000') fallo('Ese usuario tiene pedidos registrados y no se puede eliminar.');
        throw $e;
    }
    foreach ($fotos as $f) borrarFoto($f);
}


function accionRecetaGuardar() {
    $yo = exigirLogin();
    $d = entrada();
    $id     = entero('id');
    $titulo = texto('titulo', 150);
    $desc   = texto('desc', 500);
    $cat    = entero('cat');
    $tiempo = entero('tiempo');
    $ingredientes = listaLineas(isset($d['ingredientes']) ? $d['ingredientes'] : []);
    $pasos        = listaLineas(isset($d['pasos']) ? $d['pasos'] : []);
    if ($titulo === '' || $desc === '' || !$ingredientes || !$pasos || $tiempo < 1 || $tiempo > 100000) {
        fallo('Completá todos los campos obligatorios.');
    }
    $pdo = db();
    $st = $pdo->prepare('SELECT 1 FROM CATEGORIA WHERE id_categoria = ?');
    $st->execute([$cat]);
    if (!$st->fetch()) fallo('Elegí una categoría válida.');

    $fotoAnterior = null;
    if ($id) {
        $st = $pdo->prepare('SELECT id_usuario, imagen FROM RECETA WHERE id_receta = ?');
        $st->execute([$id]);
        $fila = $st->fetch();
        if (!$fila) fallo('La receta no existe.', 404);
        if ((int)$yo['id_rol'] !== 1 && (int)$fila['id_usuario'] !== (int)$yo['id_usuario']) fallo('No tenés permiso para editar esta receta.', 403);
        $fotoAnterior = $fila['imagen'];
    }

    $foto = (!empty($d['foto']) && is_string($d['foto'])) ? guardarFoto($d['foto']) : null;
    $textoIng = mb_substr(implode("\n", $ingredientes), 0, 60000);
    $textoPas = mb_substr(implode("\n", $pasos), 0, 60000);

    if ($id) {
        $st = $pdo->prepare('UPDATE RECETA SET id_categoria = ?, titulo = ?, descripcion = ?, ingredientes = ?, instrucciones = ?,
                             tiempo_preparacion = ?, imagen = COALESCE(?, imagen) WHERE id_receta = ?');
        $st->execute([$cat, $titulo, $desc, $textoIng, $textoPas, $tiempo, $foto, $id]);
        if ($foto && $fotoAnterior) borrarFoto($fotoAnterior);
    } else {
        $st = $pdo->prepare('INSERT INTO RECETA (id_usuario, id_categoria, titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, imagen)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $st->execute([(int)$yo['id_usuario'], $cat, $titulo, $desc, $textoIng, $textoPas, $tiempo, $foto]);
        $id = (int)$pdo->lastInsertId();
    }
    responder(['ok' => true, 'id' => $id]);
}

function accionRecetaEliminar() {
    $yo = exigirLogin();
    $id = entero('id');
    $pdo = db();
    $st = $pdo->prepare('SELECT id_usuario, imagen FROM RECETA WHERE id_receta = ?');
    $st->execute([$id]);
    $fila = $st->fetch();
    if (!$fila) fallo('La receta no existe.', 404);
    if ((int)$yo['id_rol'] !== 1 && (int)$fila['id_usuario'] !== (int)$yo['id_usuario']) fallo('No tenés permiso para eliminar esta receta.', 403);
    $pdo->prepare('DELETE FROM RECETA WHERE id_receta = ?')->execute([$id]);
    borrarFoto($fila['imagen']);
}

function guardarFoto($dataUrl) {
    $prefijo = 'data:image/jpeg;base64,';
    if (strpos($dataUrl, $prefijo) !== 0) fallo('La foto no tiene un formato válido.');
    $binario = base64_decode(substr($dataUrl, strlen($prefijo)), true);
    if ($binario === false) fallo('La foto no tiene un formato válido.');
    if (strlen($binario) > 3 * 1024 * 1024) fallo('La foto es muy pesada. Probá con otra más chica.');
    $info = @getimagesizefromstring($binario);
    if (!$info || $info[2] !== IMAGETYPE_JPEG) fallo('El archivo no es una imagen válida.');

    $carpeta = dirname(__DIR__) . '/img/recetas';
    if (!is_dir($carpeta)) @mkdir($carpeta, 0775, true);
    $nombre = 'receta_' . bin2hex(random_bytes(8)) . '.jpg';
    if (@file_put_contents($carpeta . '/' . $nombre, $binario) === false) fallo('No se pudo guardar la foto en el servidor (revisá los permisos de img/recetas).', 500);
    return $nombre;
}

function borrarFoto($nombre) {
    if (is_string($nombre) && preg_match('/^receta_[a-f0-9]+\.jpg$/', $nombre)) {
        @unlink(dirname(__DIR__) . '/img/recetas/' . $nombre);
    }
}


function accionComentar() {
    $yo = exigirLogin();
    $idReceta = entero('receta');
    $texto = texto('texto', 1000);
    $nota = entero('nota');
    if ($nota < 0 || $nota > 5) fallo('Calificación inválida.');
    if ($texto === '' && $nota === 0) fallo('Escribí un comentario o elegí una calificación.');
    if (!recetaExiste($idReceta)) fallo('La receta no existe.', 404);

    $pdo = db();
    $pdo->beginTransaction();
    if ($nota > 0) {   
        $st = $pdo->prepare('INSERT INTO CALIFICACION (id_receta, id_usuario, puntuacion) VALUES (?, ?, ?)
                             ON DUPLICATE KEY UPDATE puntuacion = VALUES(puntuacion), fecha = CURRENT_TIMESTAMP');
        $st->execute([$idReceta, (int)$yo['id_usuario'], $nota]);
    }
    $st = $pdo->prepare('INSERT INTO COMENTARIO (id_receta, id_usuario, texto) VALUES (?, ?, ?)');
    $st->execute([$idReceta, (int)$yo['id_usuario'], $texto !== '' ? $texto : '(solo calificación)']);
    $pdo->commit();
}

function accionComentarioEliminar() {
    $yo = exigirLogin();
    $id = entero('id');
    $pdo = db();
    $st = $pdo->prepare('SELECT id_receta, id_usuario FROM COMENTARIO WHERE id_comentario = ?');
    $st->execute([$id]);
    $c = $st->fetch();
    if (!$c) fallo('El comentario no existe.', 404);
    if ((int)$yo['id_rol'] !== 1 && (int)$c['id_usuario'] !== (int)$yo['id_usuario']) fallo('No tenés permiso para eliminar este comentario.', 403);

    $pdo->prepare('DELETE FROM COMENTARIO WHERE id_comentario = ?')->execute([$id]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM COMENTARIO WHERE id_receta = ? AND id_usuario = ?');
    $st->execute([(int)$c['id_receta'], (int)$c['id_usuario']]);
    if ((int)$st->fetchColumn() === 0) {
        $pdo->prepare('DELETE FROM CALIFICACION WHERE id_receta = ? AND id_usuario = ?')->execute([(int)$c['id_receta'], (int)$c['id_usuario']]);
    }
}

function accionFavorito() {
    $yo = exigirLogin();
    $idReceta = entero('receta');
    if (!recetaExiste($idReceta)) fallo('La receta no existe.', 404);
    $st = db()->prepare('DELETE FROM FAVORITO WHERE id_usuario = ? AND id_receta = ?');
    $st->execute([(int)$yo['id_usuario'], $idReceta]);
    if ($st->rowCount() === 0) {
        db()->prepare('INSERT IGNORE INTO FAVORITO (id_usuario, id_receta) VALUES (?, ?)')->execute([(int)$yo['id_usuario'], $idReceta]);
    }
}

function accionSeguir() {
    $yo = exigirLogin();
    $id = entero('id');
    if ($id === (int)$yo['id_usuario']) fallo('No podés seguirte a vos mismo.');
    $st = db()->prepare('SELECT 1 FROM USUARIO WHERE id_usuario = ?');
    $st->execute([$id]);
    if (!$st->fetch()) fallo('El usuario no existe.', 404);
    $st = db()->prepare('DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?');
    $st->execute([(int)$yo['id_usuario'], $id]);
    if ($st->rowCount() === 0) {
        db()->prepare('INSERT IGNORE INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)')->execute([(int)$yo['id_usuario'], $id]);
    }
}

function recetaExiste($id) {
    $st = db()->prepare('SELECT 1 FROM RECETA WHERE id_receta = ?');
    $st->execute([$id]);
    return (bool)$st->fetch();
}


function productoExiste($id) {
    $st = db()->prepare('SELECT 1 FROM PRODUCTO WHERE id_producto = ? AND activo = 1');
    $st->execute([$id]);
    return (bool)$st->fetch();
}

function carritoItems() {
    $items = [];
    $yo = usuarioActual();
    if ($yo) {
        $st = db()->prepare('SELECT ci.id_producto, ci.cantidad FROM CARRITO_ITEM ci
                             JOIN PRODUCTO p ON p.id_producto = ci.id_producto AND p.activo = 1
                             WHERE ci.id_usuario = ? ORDER BY ci.agregado, ci.id_producto');
        $st->execute([(int)$yo['id_usuario']]);
        foreach ($st as $f) $items[] = ['id' => (int)$f['id_producto'], 'cant' => (int)$f['cantidad']];
    } elseif (!empty($_SESSION['carrito'])) {
        foreach ($_SESSION['carrito'] as $id => $cant) $items[] = ['id' => (int)$id, 'cant' => (int)$cant];
    }
    return $items;
}

function carritoFijar($idProducto, $cantidad) {
    $cantidad = max(0, min(99, (int)$cantidad));
    $yo = usuarioActual();
    if ($yo) {
        if ($cantidad === 0) {
            db()->prepare('DELETE FROM CARRITO_ITEM WHERE id_usuario = ? AND id_producto = ?')->execute([(int)$yo['id_usuario'], $idProducto]);
        } else {
            db()->prepare('INSERT INTO CARRITO_ITEM (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)')->execute([(int)$yo['id_usuario'], $idProducto, $cantidad]);
        }
    } else {
        if ($cantidad === 0) unset($_SESSION['carrito'][$idProducto]);
        else $_SESSION['carrito'][$idProducto] = $cantidad;
    }
}

function accionCarritoAgregar() {
    $id = entero('id');
    $cant = entero('cant');
    if ($cant < 1) fallo('La cantidad tiene que ser al menos 1.');
    if (!productoExiste($id)) fallo('Ese producto no existe.', 404);
    $actual = 0;
    foreach (carritoItems() as $it) if ($it['id'] === $id) $actual = $it['cant'];
    carritoFijar($id, $actual + $cant);
}

function accionCarritoFijar() {
    $id = entero('id');
    if (!productoExiste($id)) fallo('Ese producto no existe.', 404);
    carritoFijar($id, entero('cant'));
}

function accionCarritoVaciar() {
    $yo = usuarioActual();
    if ($yo) db()->prepare('DELETE FROM CARRITO_ITEM WHERE id_usuario = ?')->execute([(int)$yo['id_usuario']]);
    unset($_SESSION['carrito'], $_SESSION['cupon']);
}

function buscarCupon($codigo) {
    $st = db()->prepare('SELECT codigo, porcentaje FROM CUPON WHERE codigo = ? AND activo = 1 AND (vence IS NULL OR vence >= CURDATE())');
    $st->execute([(string)$codigo]);
    return $st->fetch() ?: null;
}

function accionCupon() {
    $c = buscarCupon(strtoupper(texto('codigo', 30)));
    if ($c) $_SESSION['cupon'] = $c['codigo'];
    else unset($_SESSION['cupon']);
    responder(['ok' => true, 'valido' => (bool)$c, 'porcentaje' => $c ? (int)$c['porcentaje'] : 0]);
}

function accionPedidoConfirmar() {
    $yo = exigirLogin();
    $metodo = texto('metodo', 20);
    if (!in_array($metodo, ['tarjeta', 'mercadopago'], true)) fallo('Método de pago inválido.');
    $items = carritoItems();
    if (!$items) fallo('Tu carrito está vacío.');

    $pdo = db();
    $pdo->beginTransaction();
    $subtotal = 0;
    $lineas = [];
    foreach ($items as $it) {
        $st = $pdo->prepare('SELECT nombre, precio FROM PRODUCTO WHERE id_producto = ? AND activo = 1');
        $st->execute([$it['id']]);
        $p = $st->fetch();
        if (!$p) { $pdo->rollBack(); fallo('Un producto de tu carrito ya no está disponible.'); }
        $up = $pdo->prepare('UPDATE PRODUCTO SET stock = stock - ? WHERE id_producto = ? AND stock >= ?');
        $up->execute([$it['cant'], $it['id'], $it['cant']]);
        if ($up->rowCount() !== 1) { $pdo->rollBack(); fallo('No hay stock suficiente de "' . $p['nombre'] . '".'); }
        $subtotal += $p['precio'] * $it['cant'];
        $lineas[] = [$it['id'], $it['cant'], $p['precio']];
    }

    $codigo = null;
    $porcentaje = 0;
    if (!empty($_SESSION['cupon']) && ($c = buscarCupon($_SESSION['cupon']))) {
        $codigo = $c['codigo'];
        $porcentaje = (int)$c['porcentaje'];
    }
    $total = (int)round($subtotal * (100 - $porcentaje) / 100);

    $st = $pdo->prepare('INSERT INTO PEDIDO (id_usuario, metodo_pago, codigo_cupon, subtotal, descuento, monto_total, estado)
                         VALUES (?, ?, ?, ?, ?, ?, \'pagado\')');
    $st->execute([(int)$yo['id_usuario'], $metodo, $codigo, $subtotal, $subtotal - $total, $total]);
    $idPedido = (int)$pdo->lastInsertId();
    $st = $pdo->prepare('INSERT INTO PEDIDO_ITEM (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');
    foreach ($lineas as $l) $st->execute([$idPedido, $l[0], $l[1], $l[2]]);
    $pdo->prepare('DELETE FROM CARRITO_ITEM WHERE id_usuario = ?')->execute([(int)$yo['id_usuario']]);
    $pdo->commit();

    unset($_SESSION['cupon']);
    responder(['ok' => true, 'id' => $idPedido]);
}
