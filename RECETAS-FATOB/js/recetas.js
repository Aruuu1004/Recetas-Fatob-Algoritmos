var q = (parametro('q') || '').trim();
var idCat = parseInt(parametro('categoria'), 10) || 0;
var cat = CATEGORIAS.find(function (c) { return c.id === idCat; });
document.getElementById('buscaInput').value = q;
if (parametro('msg') === 'eliminada') document.getElementById('msgOk').style.display = 'block';

function dibujarListado() {
    var lista = leer('recetas', []).slice().sort(function (a, b) { return b.id - a.id; });
    if (cat) {
        lista = lista.filter(function (r) { return r.cat === cat.id; });
    } else if (q) {
        var t = q.toLowerCase();
        lista = lista.filter(function (r) {
            return (r.titulo + ' ' + r.desc + ' ' + r.ingredientes.join(' ') + ' ' + nombreCategoria(r.cat)).toLowerCase().indexOf(t) >= 0;
        });
    }
    document.getElementById('tituloListado').textContent =
        cat ? 'Categoría: ' + cat.nombre : q ? 'Resultados para "' + q + '"' : 'Todas las recetas';
    document.getElementById('listado').innerHTML = lista.length
        ? '<div class="grid grid-4">' + lista.map(tarjetaReceta).join('') + '</div>'
        : '<p class="vacio-msg">No se encontraron recetas. <a href="recetas.html"><strong>Mirá todas las recetas</strong></a>.</p>';
}
dibujarListado();
function alCambiarFavorito() { dibujarListado(); }

document.getElementById('formBusca').addEventListener('submit', function (e) {
    e.preventDefault();
    location.href = 'recetas.html?q=' + encodeURIComponent(document.getElementById('buscaInput').value.trim());
});
