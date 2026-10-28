if (!esAdmin()) location.href = 'index.html';

function dibujar() {
    document.getElementById('filas').innerHTML = leer('recetas', []).slice().sort(function (a, b) { return b.id - a.id; }).map(function (r) {
        var n = datosNota(r.id);
        return '<tr><td data-label="ID">' + r.id + '</td><td data-label="Título"><a href="receta_detalle.html?id=' + r.id + '">' + esc(r.titulo) + '</a></td>' +
            '<td data-label="Autor">' + esc(nombreUsuario(r.autor)) + '</td><td data-label="Categoría">' + esc(nombreCategoria(r.cat)) + '</td>' +
            '<td data-label="Tiempo">' + r.tiempo + ' min</td><td data-label="Calificación">★ ' + n.promedio.toFixed(1) + ' (' + n.votos + ')</td>' +
            '<td data-label="Creada">' + fechaCorta(r.fecha) + '</td><td class="acciones" data-label="Acciones">' +
            '<a class="btn-editar" href="receta_form.html?id=' + r.id + '">Editar</a> <button type="button" class="btn-eliminar" data-eliminar="' + r.id + '">Eliminar</button></td></tr>';
    }).join('');
}
document.getElementById('filas').addEventListener('click', function (e) {
    if (!e.target.dataset.eliminar) return;
    var id = parseInt(e.target.dataset.eliminar, 10);
    if (!confirm('¿Eliminar esta receta?')) return;
    accion('receta_eliminar', { id: id }).then(function (r) {
        if (!r.ok) return;
        dibujar();
        var m = document.getElementById('msgOk'); m.textContent = 'Receta eliminada correctamente.'; m.style.display = 'block';
    });
});
dibujar();
