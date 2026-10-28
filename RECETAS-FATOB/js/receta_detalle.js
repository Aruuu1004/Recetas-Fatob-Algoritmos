var idReceta = parseInt(parametro('id'), 10);
var receta = leer('recetas', []).find(function (r) { return r.id === idReceta; });
if (!receta) location.href = 'recetas.html';

var yo = usuarioActual();
function puedeEditar(idAutor) { return !!yo && (yo.rol === 1 || yo.id === idAutor); }

var EMOJIS = { fideo: '🍝', spaghetti: '🍝', pasta: '🍝', carne: '🥩', pollo: '🍗', muslo: '🍗', jamón: '🍖', salame: '🍖', cebolla: '🧅', ajo: '🧄', tomate: '🍅',
    papa: '🥔', zanahoria: '🥕', morrón: '🫑', choclo: '🌽', palta: '🥑', huevo: '🥚', leche: '🥛', crema: '🥛', manteca: '🧈', queso: '🧀', harina: '🌾', arroz: '🍚',
    pan: '🍞', azúcar: '🍬', chocolate: '🍫', limón: '🍋', aceite: '🫒', aceituna: '🫒', sal: '🧂', pimienta: '🧂', orégano: '🌿', perejil: '🌿', agua: '💧', puré: '🥫',
    arveja: '🫛', nuez: '🌰', vainilla: '🌼' };
function emojiIngrediente(t) {
    t = t.toLowerCase();
    for (var k in EMOJIS) if (t.indexOf(k) >= 0) return EMOJIS[k];
    return '🍴';
}

function nombreCorto(t) {
    t = t.replace(/^[\d\s,.\/]+/, '').replace(/^(kg|g|gr|ml|l|tazas?|cucharadas?|cucharaditas?|dientes?|latas?)\b\.?\s*/i, '').replace(/^(de|del)\s+/i, '').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
}
function partirPaso(texto, i) {
    var m = texto.match(/^([^:.]{3,40}):\s+(.+)$/);
    return m ? { titulo: m[1], texto: m[2] } : { titulo: 'Paso ' + (i + 1), texto: texto };
}

function dibujar() {
    var n = datosNota(receta.id);
    var img = srcImagen(receta);
    var cat = CATEGORIAS.find(function (c) { return c.id === receta.cat; });
    var comentarios = leer('comentarios', []).filter(function (c) { return c.receta === receta.id; })
        .sort(function (a, b) { return b.id - a.id; });
    var miNota = 0;
    if (yo) comentarios.forEach(function (c) { if (c.usuario === yo.id && c.nota) miNota = c.nota; });

    var acciones = '';
    var fav = yo ? '<button type="button" class="fav-btn' + (esFavorita(receta.id) ? ' activo' : '') + '" data-fav="' + receta.id + '" aria-label="' + (esFavorita(receta.id) ? 'Quitar de mis favoritas' : 'Agregar a mis favoritas') + '" title="' + (esFavorita(receta.id) ? 'Quitar de mis favoritas' : 'Agregar a mis favoritas') + '">' + (esFavorita(receta.id) ? '♥' : '♡') + '</button>' : '';
    if (puedeEditar(receta.autor)) acciones += '<a class="boton boton-claro" href="receta_form.html?id=' + receta.id + '">Editar</a><button type="button" class="peligro" id="btnEliminar">Eliminar</button>';

    var estrellasForm = '';
    for (var i = 5; i >= 1; i--) {
        estrellasForm += '<input type="radio" id="nota' + i + '" name="puntuacion" value="' + i + '"' + (miNota === i ? ' checked' : '') + '><label for="nota' + i + '" title="' + i + ' estrellas">★</label>';
    }

    document.getElementById('detalle').innerHTML =
        (parametro('msg') === 'editada' ? '<p class="msg ok">Receta actualizada.</p>' : '') +
        '<a class="volver" href="recetas.html" aria-label="Volver a las recetas"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
        '<section class="receta-portada">' +
            '<div class="portada-marco">' +
            (img ? '<div class="carousel"><div class="carousel-track"><div class="carousel-item"><img src="' + img + '" alt="' + esc(receta.titulo) + '"></div></div></div>'
                 : '<div class="portada-img sin-imagen"></div>') + fav + '</div>' +
            (cat ? '<a class="cat-link" href="recetas.html?categoria=' + cat.id + '"><span class="cat-tag cat-' + cat.clase + '">' + cat.nombre + '</span></a>' : '') +
            '<h1 class="receta-titulo">' + esc(receta.titulo) + '</h1>' +
            '<p class="receta-meta"><span>Por <a href="perfil.html?id=' + receta.autor + '" style="color:inherit;text-decoration:underline">' + esc(nombreUsuario(receta.autor)) + '</a></span>' +
            '<span>' + receta.tiempo + ' min</span><span>★ ' + n.promedio.toFixed(1) + ' (' + n.votos + ' votos)</span></p>' +
        '</section>' +
        (receta.desc ? '<p class="receta-desc">' + esc(receta.desc) + '</p>' : '') +
        (acciones ? '<div class="receta-acciones">' + acciones + '</div>' : '') +
        '<div class="receta-cuerpo">' +
            '<section><div class="barra-titulo"><h3>Instrucciones</h3></div><div class="pasos">' +
            receta.pasos.map(function (p, i) {
                var x = partirPaso(p, i);
                return '<article class="paso"><div class="paso-cab"><span class="paso-num">' + (i + 1) + '</span><h4>' + esc(x.titulo) + '</h4></div><p>' + esc(x.texto) + '</p></article>';
            }).join('') + '</div></section>' +
            '<aside class="comentarios-panel" id="comentarios"><h3>Comentarios y Calificaciones (' + comentarios.length + ')</h3><div class="comentarios-lista">' +
            (comentarios.length ? comentarios.map(function (c) {
                return '<div class="coment"><div class="coment-avatar">' + AVATAR + '</div><div><div class="coment-nombre">' + esc(nombreUsuario(c.usuario)) +
                    '<span class="coment-fecha">' + fechaCorta(c.fecha) + '</span></div><p class="coment-texto">' + esc(c.texto) + '</p></div>' +
                    (c.nota ? '<div class="coment-estrellas">' + '★'.repeat(c.nota) + '☆'.repeat(5 - c.nota) + '</div>' : '') +
                    (puedeEditar(c.usuario) ? '<form class="coment-borrar"><button type="button" data-borrar="' + c.id + '">Eliminar</button></form>' : '') + '</div>';
            }).join('') : '<p class="sin-comentarios">Todavía no hay comentarios. ¡Sé la primera persona en opinar!</p>') + '</div>' +
            (yo ? '<form class="comentar-form" id="formComentar"><label for="texto">Dejanos tu comentario y calificación</label><textarea id="texto" rows="3" maxlength="1000" placeholder="Escribí tu comentario..."></textarea>' +
                  '<div class="estrellas-input" role="radiogroup" aria-label="Tu calificación">' + estrellasForm + '</div><button type="submit">' + (miNota ? 'Actualizar' : 'Enviar') + '</button></form>'
                : '<p class="comentar-aviso"><a href="login.html"><strong>Iniciá sesión</strong></a> para comentar y calificar esta receta.</p>') +
            '</aside></div>' +
        '<section class="ingredientes-bloque"><h3>Ingredientes</h3><ul class="ingredientes-fila">' +
        receta.ingredientes.map(function (ing) {
            return '<li class="ing" title="' + esc(ing) + '"><span class="ing-icono">' + emojiIngrediente(ing) + '</span><span class="ing-nombre">' + esc(nombreCorto(ing)) + '</span></li>';
        }).join('') + '</ul></section>';

    iniciarCarousels();
    conectarBotones();
}

function conectarBotones() {
    var del = document.getElementById('btnEliminar');
    if (del) del.addEventListener('click', function () {
        if (!confirm('¿Eliminar esta receta?')) return;
        api('receta_eliminar', { id: receta.id }).then(function (r) {
            if (r.ok) location.href = 'recetas.html?msg=eliminada'; else alert(r.error);
        });
    });
    document.querySelectorAll('[data-borrar]').forEach(function (b) {
        b.addEventListener('click', function () {
            if (!confirm('¿Eliminar comentario?')) return;
            accion('comentario_eliminar', { id: parseInt(b.dataset.borrar, 10) }).then(function (r) { if (r.ok) dibujar(); });
        });
    });
    var form = document.getElementById('formComentar');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var texto = document.getElementById('texto').value.trim();
        var marcada = form.querySelector('input[name="puntuacion"]:checked');
        var nota = marcada ? parseInt(marcada.value, 10) : 0;
        if (!texto && !nota) { alert('Escribí un comentario o elegí una calificación.'); return; }
        accion('comentar', { receta: receta.id, texto: texto, nota: nota }).then(function (r) { if (r.ok) dibujar(); });
    });
}
function alCambiarFavorito() { dibujar(); }
dibujar();
