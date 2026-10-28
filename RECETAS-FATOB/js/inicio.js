var recetas = leer('recetas', []);
var u = usuarioActual();

if (u) document.getElementById('saludo').textContent = '¡Hola, ' + u.nombre.split(' ')[0] + '!';

function recetasDelDia() {
    var dia = Math.floor(Date.now() / 86400000);
    return recetas.slice().sort(function (a, b) {
        return ((a.id * 7 + dia) % 13) - ((b.id * 7 + dia) % 13);
    }).slice(0, 3);
}

function dibujarInicio() {
    var dia = recetasDelDia();
    document.getElementById('recetasDia').innerHTML = dia.map(tarjetaReceta).join('') ||
        '<p class="vacio-msg">Todavía no hay recetas.</p>';

    var conFoto = dia.find(function (r) { return r.imagen; });
    document.getElementById('fotoHero').innerHTML = conFoto
        ? '<img src="' + srcImagen(conFoto) + '" alt="' + esc(conFoto.titulo) + '">'
        : '<div class="sin-imagen"></div>';

    var ranking = recetas.slice().sort(function (a, b) {
        var na = datosNota(a.id), nb = datosNota(b.id);
        return nb.promedio - na.promedio || nb.votos - na.votos;
    }).slice(0, 10);
    document.getElementById('masValoradas').innerHTML = ranking.map(function (r) {
        return '<div class="carousel-item">' + tarjetaReceta(r) + '</div>';
    }).join('');
}
dibujarInicio();
iniciarCarousels();
function alCambiarFavorito() { dibujarInicio(); } 

document.getElementById('categorias').innerHTML = CATEGORIAS.map(function (c) {
    return '<a class="cat" href="recetas.html?categoria=' + c.id + '"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + c.icono + '</svg>' + c.nombre + '</a>';
}).join('');

var modo = 'recetas';
var input = document.getElementById('buscaInput');
var resultados = document.getElementById('buscaResultados');
var botonesModo = document.querySelectorAll('.busca-modo button');

botonesModo.forEach(function (b) {
    b.addEventListener('click', function () {
        modo = b.dataset.modo;
        botonesModo.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        input.placeholder = modo === 'recetas' ? 'Buscar recetas, ingredientes o categorías...' : 'Buscar cocineros por nombre...';
        resultados.innerHTML = '';
        input.focus();
    });
});

document.getElementById('formBusca').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (modo === 'recetas') { location.href = 'recetas.html?q=' + encodeURIComponent(q); return; }
    if (q.length < 2) { resultados.innerHTML = '<div class="res vacio">Escribí al menos 2 caracteres</div>'; return; }
    var lista = leer('usuarios', []).filter(function (x) { return x.nombre.toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    resultados.innerHTML = lista.length
        ? lista.map(function (x) { return '<div class="res"><a href="perfil.html?id=' + x.id + '">' + esc(x.nombre) + '</a></div>'; }).join('')
        : '<div class="res vacio">No se encontraron cocineros</div>';
});
document.addEventListener('click', function (e) { if (!e.target.closest('.busca')) resultados.innerHTML = ''; });
