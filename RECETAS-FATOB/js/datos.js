

var ESTADO = {};
var PRODUCTOS = [];   
var CUPONES = {};     

function leer(clave, porDefecto) {
    return (ESTADO[clave] === undefined || ESTADO[clave] === null) ? porDefecto : ESTADO[clave];
}

function leerLocal(clave, porDefecto) {
    try {
        var v = localStorage.getItem('fatob_' + clave);
        return v === null ? porDefecto : JSON.parse(v);
    } catch (e) { return porDefecto; }
}
function guardarLocal(clave, valor) {
    try { localStorage.setItem('fatob_' + clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento: no pasa nada */ }
}

var API = 'api/api.php';

function api(nombre, datos) {
    return fetch(API + '?accion=' + nombre, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos || {})
    }).then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'No se pudo conectar con el servidor.' }; });
}

function cargarEstado() {
    return fetch(API + '?accion=estado', { credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('estado'); return r.json(); })
        .then(function (e) {
            ESTADO = e;
            PRODUCTOS = e.productos || [];
            CUPONES = e.cupones || {};
        });
}


function accion(nombre, datos, silencioso) {
    return api(nombre, datos).then(function (r) {
        if (!r.ok) {
            if (!silencioso) alert(r.error || 'No se pudo completar la acción.');
            return r;
        }
        return cargarEstado().then(function () { return r; }, function () { return r; });
    });
}

function mostrarErrorConexion() {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#8a1c1c;color:#fff;padding:14px 18px;font:15px/1.4 sans-serif;text-align:center';
    d.innerHTML = '<strong>No se pudo conectar con la base de datos.</strong> Abrí el sitio desde <b>http://localhost/RECETAS-FATOB/</b> con Apache y MySQL encendidos (XAMPP) y la base importada.';
    document.body.appendChild(d);
}


(function () {
    function empezar() {
        var pendientes = Array.prototype.slice.call(document.querySelectorAll('script[data-src]'));
        function siguiente() {
            var viejo = pendientes.shift();
            if (!viejo) return;
            var s = document.createElement('script');
            s.onload = s.onerror = siguiente;
            s.src = viejo.getAttribute('data-src');
            document.body.appendChild(s);
        }
        cargarEstado().then(siguiente, mostrarErrorConexion);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', empezar);
    else empezar();
})();

var CATEGORIAS = [
    { id: 1, nombre: 'Comidas principales', clase: 'principales', icono: '<path d="M6 40h36M10 40a14 14 0 0 1 28 0M24 22v-4M20 18h8"/>' },
    { id: 2, nombre: 'Postres', clase: 'postres', icono: '<path d="M12 26h24l-3 14H15zM12 26c-4-2-4-8 0-10 0-6 8-8 12-4 4-4 12-2 12 4 4 2 4 8 0 10M24 26v14"/>' },
    { id: 3, nombre: 'Desayunos y meriendas', clase: 'desayunos', icono: '<path d="M8 20h24v10a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9zM32 23h3a5 5 0 0 1 0 10h-3M15 9c0 3 3 3 3 6M23 9c0 3 3 3 3 6"/>' },
    { id: 4, nombre: 'Entradas y picadas', clase: 'entradas', icono: '<path d="M6 16h30a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4zM40 27h6"/>' },
    { id: 5, nombre: 'Comidas saludables', clase: 'saludables', icono: '<path d="M6 22h36a18 18 0 0 1-36 0zM14 22c0-6 5-10 10-10M24 22c2-7 8-10 13-8"/>' }
];

function usuarioActual() {
    var id = leer('sesion', null);
    if (!id) return null;
    return leer('usuarios', []).find(function (u) { return u.id === id; }) || null;
}
function esAdmin() { var u = usuarioActual(); return !!u && u.rol === 1; }
function exigirLogin() {
    if (!usuarioActual()) { location.href = 'login.html?error=acceso'; return false; }
    return true;
}
function cerrarSesion() { api('logout').then(function () { location.href = 'login.html?logout=1'; }); }

function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; }
function parametro(nombre) { return new URLSearchParams(location.search).get(nombre); }
function precio(n) { return '$' + Number(n).toLocaleString('es-AR'); }
function nombreCategoria(id) { var c = CATEGORIAS.find(function (x) { return x.id === id; }); return c ? c.nombre : ''; }
function nombreUsuario(id) { var u = leer('usuarios', []).find(function (x) { return x.id === id; }); return u ? u.nombre : 'Usuario'; }
function fechaCorta(f) { var p = String(f).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

function datosNota(idReceta) {
    var notas = leer('calificaciones', []).filter(function (c) { return c.receta === idReceta; });
    var suma = notas.reduce(function (s, c) { return s + c.nota; }, 0);
    return { promedio: notas.length ? suma / notas.length : 0, votos: notas.length };
}
function esFavorita(idReceta) {
    var u = usuarioActual();
    return !!u && leer('favoritos', []).some(function (f) { return f.usuario === u.id && f.receta === idReceta; });
}
function alternarFavorito(idReceta) {
    if (!usuarioActual()) { location.href = 'login.html?error=acceso'; return Promise.resolve(); }
    return accion('favorito', { receta: idReceta });   
}
function srcImagen(r) {
    if (!r.imagen) return '';
    return r.imagen.indexOf('data:') === 0 ? r.imagen : 'img/recetas/' + r.imagen;
}

var ICO_RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
var ICO_ESTRELLA = '<svg class="estrella" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
var AVATAR = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="34" r="19" fill="#e2b9a7"/><path d="M12 100c0-24 17-40 38-40s38 16 38 40z" fill="#e2b9a7"/></svg>';

function tarjetaReceta(r) {
    var n = datosNota(r.id);
    var img = srcImagen(r);
    var cat = CATEGORIAS.find(function (c) { return c.id === r.cat; });
    var corazon = usuarioActual()
        ? '<button type="button" class="fav-btn' + (esFavorita(r.id) ? ' activo' : '') + '" data-fav="' + r.id + '" aria-label="Favorita">' + (esFavorita(r.id) ? '♥' : '♡') + '</button>' : '';
    return '<article class="card">' + corazon +
        '<a class="card-img" href="receta_detalle.html?id=' + r.id + '" tabindex="-1" aria-hidden="true">' +
        (img ? '<img src="' + img + '" alt="" loading="lazy">' : '<div class="sin-imagen"></div>') + '</a>' +
        '<div class="card-body">' +
        (cat ? '<span class="cat-tag cat-' + cat.clase + '">' + cat.nombre + '</span>' : '') +
        '<h3><a href="receta_detalle.html?id=' + r.id + '">' + esc(r.titulo) + '</a></h3>' +
        '<div class="card-datos"><span>' + ICO_RELOJ + ' ' + r.tiempo + ' min</span>' +
        '<span>' + ICO_ESTRELLA + ' ' + n.promedio.toFixed(1) + ' (' + n.votos + ')</span></div>' +
        '<a class="ver-mas" href="receta_detalle.html?id=' + r.id + '">Ver receta</a></div></article>';
}

function leerCarrito() { return leer('carrito', []); }
function agregarAlCarrito(id, cant) { return accion('carrito_agregar', { id: id, cant: cant }); }
function totalCarrito() {
    return leerCarrito().reduce(function (s, i) {
        var p = PRODUCTOS.find(function (x) { return x.id === i.id; });
        return s + (p ? p.precio * i.cant : 0);
    }, 0);
}
function cantidadCarrito() { return leerCarrito().reduce(function (s, i) { return s + i.cant; }, 0); }
function totalConDescuento() {
    var cupon = leer('cupon', null);
    var desc = cupon && CUPONES[cupon] ? CUPONES[cupon] : 0;
    return Math.round(totalCarrito() * (100 - desc) / 100);
}
function imagenProducto(p) {
    return p.imagen ? '<img src="img/productos/' + p.imagen + '" alt="' + esc(p.nombre) + '">' : '';
}
