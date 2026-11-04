
function refrescarCabecera() {
    var acciones = document.querySelector('.nav-acciones');
    if (!acciones) return;
    var u = usuarioActual();
    var menu = acciones.querySelector('details.nav-user');
    if (menu) menu.remove();

    acciones.querySelectorAll('[data-sin-sesion]').forEach(function (a) {
        a.hidden = !!u;
    });

    if (u) {
        var det = document.createElement('details');
        det.className = 'nav-user';
        det.innerHTML =
            '<summary aria-label="Menú de mi cuenta">' +
            '<span class="nav-avatar">' +
            AVATAR +
            '</span><span class="nav-nombre">' +
            esc(u.nombre) +
            '</span></summary>' +
            '<ul class="nav-user-menu">' +
            '<li><a href="perfil.html">Mi perfil</a></li>' +
            '<li><a href="perfil.html?seccion=favoritas">Mis recetas favoritas</a></li>' +
            '<li><a href="receta_form.html">Nueva receta</a></li>' +
            (u.rol === 1
                ? '<li class="sep"></li><li><a href="usuario.html">Admin usuarios</a></li><li><a href="admin_recetas.html">Admin recetas</a></li>'
                : '') +
            '<li class="sep"></li><li><a href="#" id="btnSalir">Cerrar sesión</a></li></ul>';
        acciones.appendChild(det);
        document.getElementById('btnSalir').addEventListener('click', function (e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    actualizarBurbujaCarrito();
}

function actualizarBurbujaCarrito() {
    var n = cantidadCarrito(),
        b = document.getElementById('carritoN');
    if (b) {
        b.textContent = n;
        b.style.display = n ? 'flex' : 'none';
    }
}

(function () {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    if (leerLocal('cookies', false)) {
        banner.remove();
        return;
    }
    document.getElementById('btnAceptarCookies').addEventListener('click', function () {
        guardarLocal('cookies', true);
        banner.remove();
    });
})();

refrescarCabecera();

document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (!b) return;
    var id = parseInt(b.dataset.fav, 10);
    Promise.resolve(alternarFavorito(id)).then(function () {
        if (typeof alCambiarFavorito === 'function') alCambiarFavorito();
        else b.textContent = esFavorita(id) ? '♥' : '♡';
    });
});
