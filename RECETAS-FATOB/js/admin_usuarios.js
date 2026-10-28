if (!esAdmin()) location.href = 'index.html';
var yo = usuarioActual();
if (parametro('msg') === 'creado') { var m = document.getElementById('msgOk'); m.textContent = 'Usuario creado con éxito.'; m.style.display = 'block'; }

function dibujar() {
    document.getElementById('filas').innerHTML = leer('usuarios', []).map(function (u) {
        return '<tr><td data-label="ID">' + u.id + '</td>' +
            '<td data-label="Nombre"><input type="text" id="n' + u.id + '" value="' + esc(u.nombre) + '"></td>' +
            '<td data-label="Email"><input type="email" id="e' + u.id + '" value="' + esc(u.email) + '"></td>' +
            '<td data-label="Rol"><select id="r' + u.id + '"><option value="2"' + (u.rol === 2 ? ' selected' : '') + '>Usuario</option><option value="1"' + (u.rol === 1 ? ' selected' : '') + '>Administrador</option></select></td>' +
            '<td data-label="Registro">' + fechaCorta(u.fecha) + '</td>' +
            '<td class="acciones" data-label="Acciones"><button type="button" class="btn-editar" data-guardar="' + u.id + '">Guardar</button> ' +
            '<button type="button" class="btn-eliminar" data-eliminar="' + u.id + '">Eliminar</button></td></tr>';
    }).join('');
}
function avisar(id, texto) {
    document.getElementById('msgOk').style.display = 'none'; document.getElementById('msgError').style.display = 'none';
    var el = document.getElementById(id); el.textContent = texto; el.style.display = 'block';
}
document.getElementById('filas').addEventListener('click', function (e) {
    var g = e.target.dataset.guardar, d = e.target.dataset.eliminar;
    if (g) {
        var id = parseInt(g, 10), u = leer('usuarios', []).find(function (x) { return x.id === id; });
        accion('usuario_guardar', {
            id: id,
            nombre: document.getElementById('n' + id).value.trim() || u.nombre,
            email: document.getElementById('e' + id).value.trim() || u.email,
            rol: parseInt(document.getElementById('r' + id).value, 10)
        }, true).then(function (r) {
            if (r.ok) { dibujar(); avisar('msgOk', 'Usuario actualizado con éxito.'); }
            else avisar('msgError', r.error);
        });
    }
    if (d) {
        var idEl = parseInt(d, 10);
        if (idEl === yo.id) return avisar('msgError', 'No podés eliminar tu propia cuenta desde acá.');
        if (!confirm('¿Eliminar este usuario y todo lo que publicó?')) return;
        accion('usuario_eliminar', { id: idEl }, true).then(function (r) {
            if (r.ok) { dibujar(); avisar('msgOk', 'Usuario eliminado correctamente.'); }
            else avisar('msgError', r.error);
        });
    }
});
dibujar();
