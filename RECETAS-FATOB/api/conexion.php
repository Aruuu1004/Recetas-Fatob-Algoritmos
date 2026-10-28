<?php


const DB_HOST    = 'localhost';
const DB_NOMBRE  = 'recetas_fatob';
const DB_USUARIO = 'root';
const DB_CLAVE   = '';

ini_set('display_errors', '0');
error_reporting(E_ALL);

session_name('FATOBSESION');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
session_start();

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function fallo($mensaje, $codigo = 400) {
    responder(['ok' => false, 'error' => $mensaje], $codigo);
}

set_exception_handler(function ($e) {
    error_log('[FATOB] ' . $e->getMessage());
    fallo('Error del servidor. Revisá que MySQL esté encendido y que la base "recetas_fatob" esté importada.', 500);
});

function db() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NOMBRE . ';charset=utf8mb4', DB_USUARIO, DB_CLAVE, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function entrada() {
    static $datos = null;
    if ($datos === null) {
        $datos = json_decode(file_get_contents('php://input'), true);
        if (!is_array($datos)) $datos = [];
    }
    return $datos;
}
function texto($clave, $max = 255) {
    $d = entrada();
    $v = (isset($d[$clave]) && is_string($d[$clave])) ? trim($d[$clave]) : '';
    return mb_substr($v, 0, $max);
}
function claveEntrada($clave) {
    $d = entrada();
    return (isset($d[$clave]) && is_string($d[$clave])) ? $d[$clave] : '';
}
function entero($clave) {
    $d = entrada();
    return isset($d[$clave]) ? (int)$d[$clave] : 0;
}

function usuarioActual() {
    static $u = false;
    if ($u !== false) return $u;
    $u = null;
    if (!empty($_SESSION['uid'])) {
        $st = db()->prepare('SELECT id_usuario, id_rol, nombre, email FROM USUARIO WHERE id_usuario = ?');
        $st->execute([(int)$_SESSION['uid']]);
        $u = $st->fetch() ?: null;
        if (!$u) unset($_SESSION['uid']);   
    }
    return $u;
}
function exigirLogin() {
    $u = usuarioActual();
    if (!$u) fallo('Tenés que iniciar sesión.', 401);
    return $u;
}
function exigirAdmin() {
    $u = exigirLogin();
    if ((int)$u['id_rol'] !== 1) fallo('Solo los administradores pueden hacer esto.', 403);
    return $u;
}
