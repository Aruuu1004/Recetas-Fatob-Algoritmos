var yo = usuarioActual();
var idPerfil = parseInt(parametro('id'), 10) || (yo ? yo.id : 0);
if (!idPerfil) { location.href = 'login.html?error=acceso'; }
var usuarioPerfil = leer('usuarios', []).find(function (x) { return x.id === idPerfil; });
if (!usuarioPerfil) location.href = 'index.html';
var esMio = !!yo && yo.id === idPerfil;
var seccion = esMio ? (parametro('seccion') || '') : '';
var TITULOS = { editar: 'Editar perfil', recetas: 'Mis recetas', comentarios: 'Mis comentarios', favoritas: 'Mis Recetas Favoritas' };
var ICO = {
    editar: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 20l1-4L16 5l3 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    recetas: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    comentarios: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    favoritas: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" fill="currentColor"/></svg>'
};

function favoritasDe(idUsuario) {
    var ids = leer('favoritos', []).filter(function (f) { return f.usuario === idUsuario; }).map(function (f) { return f.receta; });
    return leer('recetas', []).filter(function (r) { return ids.indexOf(r.id) >= 0; });
}
function contenidoSeccion() {
    var recetas = leer('recetas', []).filter(function (r) { return r.autor === idPerfil; });
    if (seccion === 'favoritas') {
        var favs = favoritasDe(idPerfil);
        return favs.length ? '<div class="grid">' + favs.map(tarjetaReceta).join('') + '</div>' : '<p class="fav-vacio">Todavía no tenés recetas favoritas.</p>';
    }
    if (seccion === 'recetas') {
        return (recetas.length ? '<ul class="lista-simple">' + recetas.map(function (r) {
            return '<li><span class="t"><a href="receta_detalle.html?id=' + r.id + '">' + esc(r.titulo) + '</a></span><span class="acc"><a class="btn-ver" href="receta_detalle.html?id=' + r.id + '">Ver</a> <a class="btn-editar" href="receta_form.html?id=' + r.id + '">Editar</a></span><p class="s">' + r.tiempo + ' min · publicada el ' + fechaCorta(r.fecha) + '</p></li>';
        }).join('') + '</ul>' : '<p class="fav-vacio">Todavía no publicaste recetas.</p>') +
        '<div class="acciones"><a class="boton" href="receta_form.html">Publicar una receta</a></div>';
    }
    if (seccion === 'comentarios') {
        var mios = leer('comentarios', []).filter(function (c) { return c.usuario === idPerfil; });
        return mios.length ? '<ul class="lista-simple">' + mios.map(function (c) {
            var r = leer('recetas', []).find(function (x) { return x.id === c.receta; });
            return '<li><span class="t"><a href="receta_detalle.html?id=' + c.receta + '">' + esc(r ? r.titulo : 'Receta eliminada') + '</a></span><span class="acc"><button type="button" class="btn-eliminar" data-borrar="' + c.id + '">Eliminar</button></span><p class="s">' + (c.nota ? '★'.repeat(c.nota) + ' · ' : '') + esc(c.texto) + '</p></li>';
        }).join('') + '</ul>' : '<p class="fav-vacio">Todavía no hiciste comentarios.</p>';
    }
    return '<p class="msg ok" id="msgOk" style="display:none">Datos actualizados.</p><p class="msg error" id="msgError" style="display:none"></p>' +
        '<form class="formulario" id="formEditar"><label for="nombre">Nombre</label><input type="text" id="nombre" value="' + esc(yo.nombre) + '" required>' +
        '<label for="email">Correo electrónico</label><input type="email" id="email" value="' + esc(yo.email) + '" required>' +
        '<label for="clave">Nueva contraseña (dejala vacía para no cambiarla)</label><input type="password" id="clave" minlength="6">' +
        '<button type="submit">Guardar cambios</button></form>';
}

function dibujar() {
    var u = usuarioPerfil, cont = document.getElementById('perfil');
    var recetas = leer('recetas', []).filter(function (r) { return r.autor === idPerfil; });
    var seg = leer('seguidores', []);
    var seguidores = seg.filter(function (s) { return s.seguido === idPerfil; }).length;
    var seguidos = seg.filter(function (s) { return s.seguidor === idPerfil; }).length;

    if (seccion) {   
        var item = function (k) { return '<li><a href="perfil.html?seccion=' + k + '" class="' + (seccion === k ? 'activo' : '') + '">' + ICO[k] + ' ' + TITULOS[k].replace('Mis Recetas', 'Mis recetas') + '</a></li>'; };
        cont.innerHTML = '<div class="perfil-layout"><aside class="perfil-lateral"><a href="perfil.html" style="color:inherit"><div class="perfil-avatar">' + AVATAR + '</div>' +
            '<h1 class="perfil-nombre">' + esc(u.nombre) + '</h1></a><p class="perfil-email">' + esc(u.email) + '</p><ul class="menu-perfil">' +
            item('editar') + item('recetas') + item('comentarios') + item('favoritas') + '</ul></aside>' +
            '<section class="perfil-principal"><h2>' + TITULOS[seccion] + '</h2>' + contenidoSeccion() + '</section></div>';
        conectar();
        return;
    }
    var yaSigue = !!yo && seg.some(function (s) { return s.seguidor === yo.id && s.seguido === idPerfil; });
    var favs = favoritasDe(idPerfil);
    cont.innerHTML = '<section class="perfil-solo"><div class="perfil-card"><div class="perfil-avatar">' + AVATAR + '</div>' +
        '<h1 class="perfil-nombre">' + esc(u.nombre) + '</h1>' + (esMio ? '<p class="perfil-email">' + esc(u.email) + '</p>' : '') +
        '<span class="perfil-rol">' + (u.rol === 1 ? 'Administrador' : 'Usuario') + '</span>' +
        '<div class="perfil-stats"><div><strong>' + seguidores + '</strong><span>Seguidores</span></div><div><strong>' + seguidos + '</strong><span>Seguidos</span></div>' +
        (esMio ? '<a href="perfil.html?seccion=recetas"><strong>' + recetas.length + '</strong><span>Recetas</span></a><a href="perfil.html?seccion=favoritas"><strong>' + favs.length + '</strong><span>Favoritas</span></a>'
               : '<div><strong>' + recetas.length + '</strong><span>Recetas</span></div><div><strong>' + favs.length + '</strong><span>Favoritas</span></div>') + '</div>' +
        '<div class="perfil-datos"><p style="margin:0">Miembro desde el ' + fechaCorta(u.fecha) + '</p></div><div class="perfil-acciones">' +
        (esMio ? '<a class="boton" href="perfil.html?seccion=editar">Editar perfil</a><a class="boton boton-claro" href="perfil.html?seccion=favoritas">Mis recetas favoritas</a><button type="button" class="boton-claro" id="btnSalirPerfil">Cerrar sesión</button>'
               : '<button type="button" id="btnSeguir" class="' + (yaSigue ? 'boton-claro' : '') + '">' + (yaSigue ? 'Siguiendo' : 'Seguir') + '</button><a class="boton boton-claro" href="index.html">Volver al inicio</a>') +
        '</div></div>' +
        (!esMio ? '<section class="perfil-fav"><h2>Recetas favoritas</h2>' + (favs.length ? '<div class="grid">' + favs.map(tarjetaReceta).join('') + '</div>' : '<p class="fav-vacio">Todavía no hay recetas favoritas.</p>') + '</section>' : '') + '</section>';
    conectar();
}

function conectar() {
    var salir = document.getElementById('btnSalirPerfil');
    if (salir) salir.addEventListener('click', cerrarSesion);

    var seguir = document.getElementById('btnSeguir');
    if (seguir) seguir.addEventListener('click', function () {
        if (!yo) { location.href = 'login.html?error=acceso'; return; }
        accion('seguir', { id: idPerfil }).then(function (r) { if (r.ok) dibujar(); });
    });

    document.querySelectorAll('[data-borrar]').forEach(function (b) {
        b.addEventListener('click', function () {
            if (!confirm('¿Eliminar comentario?')) return;
            accion('comentario_eliminar', { id: parseInt(b.dataset.borrar, 10) }).then(function (r) { if (r.ok) dibujar(); });
        });
    });

    var form = document.getElementById('formEditar');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nombre = document.getElementById('nombre').value.trim();
        var email = document.getElementById('email').value.trim();
        var clave = document.getElementById('clave').value;
        var error = document.getElementById('msgError');
        if (!nombre || !email) { error.textContent = 'Completá nombre y correo.'; error.style.display = 'block'; return; }
        if (clave && clave.length < 6) { error.textContent = 'La contraseña debe tener al menos 6 caracteres.'; error.style.display = 'block'; return; }
        api('perfil_guardar', { nombre: nombre, email: email, clave: clave }).then(function (r) {
            if (!r.ok) { error.textContent = r.error; error.style.display = 'block'; return; }
            location.href = 'perfil.html?seccion=editar&ok=1';
        });
    });
    if (parametro('ok') && document.getElementById('msgOk')) document.getElementById('msgOk').style.display = 'block';
}
function alCambiarFavorito() { dibujar(); }
dibujar();
