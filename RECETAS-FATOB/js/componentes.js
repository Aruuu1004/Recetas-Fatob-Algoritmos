
(function () {
    var u = usuarioActual();
    var pagina = location.pathname.split('/').pop() || 'index.html';
    function activo(lista) { return lista.indexOf(pagina) >= 0 ? 'activo' : ''; }

    var ICO_CARRITO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.5l2.2 10.5h9.6L19.5 7H7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19" r="1.5" fill="currentColor"/><circle cx="16.5" cy="19" r="1.5" fill="currentColor"/></svg>';

    var cuenta;
    if (u) {
        cuenta = '<details class="nav-user"><summary aria-label="Menú de mi cuenta">' +
            '<span class="nav-avatar">' + AVATAR + '</span><span class="nav-nombre">' + esc(u.nombre) + '</span></summary>' +
            '<ul class="nav-user-menu">' +
            '<li><a href="perfil.html">Mi perfil</a></li>' +
            '<li><a href="perfil.html?seccion=favoritas">Mis recetas favoritas</a></li>' +
            '<li><a href="receta_form.html">Nueva receta</a></li>' +
            (u.rol === 1 ? '<li class="sep"></li><li><a href="usuario.html">Admin usuarios</a></li><li><a href="admin_recetas.html">Admin recetas</a></li>' : '') +
            '<li class="sep"></li><li><a href="#" id="btnSalir">Cerrar sesión</a></li></ul></details>';
    } else {
        cuenta = '<a class="nav-btn-link ' + (pagina === 'registro.html' ? 'destacado' : '') + '" href="registro.html">Registrarse</a>' +
                 '<a class="nav-btn-link ' + (pagina === 'login.html' ? 'destacado' : '') + '" href="login.html">Iniciar Sesión</a>';
    }

    var navbar = '<nav class="navbar" id="navbar"><div class="navbar-in">' +
        '<a class="brand" href="index.html"><img class="logo" src="img/logo.png" alt=""><span>RECETAS FATOB</span></a>' +
        '<button type="button" class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="navMenu"><span></span><span></span><span></span></button>' +
        '<div class="nav-menu" id="navMenu"><ul class="nav-links">' +
        '<li><a class="' + activo(['index.html']) + '" href="index.html">Inicio</a></li>' +
        '<li><a class="' + activo(['recetas.html', 'receta_detalle.html', 'receta_form.html']) + '" href="recetas.html">Recetas</a></li>' +
        '<li><a class="' + activo(['sobre_nosotros.html']) + '" href="sobre_nosotros.html">Sobre Nosotros</a></li>' +
        '<li class="solo-movil"><a class="' + activo(['tienda.html', 'producto.html']) + '" href="tienda.html">Carrito de Compras</a></li></ul>' +
        '<div class="nav-acciones"><a class="nav-carrito" href="tienda.html" aria-label="Carrito de compras">' + ICO_CARRITO +
        '<span class="nav-carrito-n" id="carritoN"></span></a>' + cuenta + '</div></div></div></nav>';

    var contacto = 'estudios.ariadna@gmail.com';
    var footer = '<footer class="footer"><div class="footer-contenido"><span></span><div class="footer-texto">' +
        '<p>¿Te interesa conocer o contactar a los creadores?</p>' +
        '<p><a class="footer-mail" href="mailto:' + contacto + '">' +
        '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg> ' + contacto + '</a></p>' +
        '<p class="chico">&copy; ' + new Date().getFullYear() + ' RECETAS FATOB - Fatob Studios. Todos los derechos reservados.</p></div>' +
        '<div class="footer-redes"><a href="https://github.com/Aruuu1004/Recetas-Fatob-Algoritmos" target="_blank" rel="noopener" aria-label="GitHub">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>' +
        '<a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a></div>' +
        '</div></footer><button id="btn-top" title="Volver arriba" aria-label="Volver arriba">↑</button>';

    var cookies = leerLocal('cookies', false) ? '' :
        '<div id="cookieBanner" role="region" aria-label="Aviso de cookies"><span>Esta página utiliza cookies para mejorar tu experiencia de navegación.</span><button type="button" id="btnAceptarCookies">Aceptar</button></div>';

    document.getElementById('nav').innerHTML = navbar + cookies;
    document.getElementById('pie').innerHTML = footer;

    var salir = document.getElementById('btnSalir');
    if (salir) salir.addEventListener('click', function (e) { e.preventDefault(); cerrarSesion(); });
    var ok = document.getElementById('btnAceptarCookies');
    if (ok) ok.addEventListener('click', function () { guardarLocal('cookies', true); document.getElementById('cookieBanner').remove(); });
})();

function actualizarBurbujaCarrito() {
    var n = cantidadCarrito(), b = document.getElementById('carritoN');
    if (b) { b.textContent = n; b.style.display = n ? 'flex' : 'none'; }
}
actualizarBurbujaCarrito();

document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (!b) return;
    var id = parseInt(b.dataset.fav, 10);
    Promise.resolve(alternarFavorito(id)).then(function () {
        if (typeof alCambiarFavorito === 'function') alCambiarFavorito(); 
        else b.textContent = esFavorita(id) ? '♥' : '♡';
    });
});
