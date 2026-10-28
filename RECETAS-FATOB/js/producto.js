var p = PRODUCTOS.find(function (x) { return x.id === parseInt(parametro('id'), 10); });
if (!p) location.href = 'tienda.html';
var stock = p.stock;   
var cantidad = 1;

function dibujar() {
    var relacionados = PRODUCTOS.filter(function (x) { return x.id !== p.id && x.cat === p.cat; })
        .concat(PRODUCTOS.filter(function (x) { return x.id !== p.id && x.cat !== p.cat; })).slice(0, 4);
    document.getElementById('producto').innerHTML =
        '<p class="migas"><a href="tienda.html">← Volver a la tienda</a> / ' + esc(p.cat) + ' / ' + esc(p.nombre) + '</p>' +
        '<section class="producto"><div class="producto-foto">' + imagenProducto(p) + '</div>' +
        '<div><h1>' + esc(p.nombre) + '</h1><p>' + esc(p.desc) + '</p><div class="precio-grande">' + precio(p.precio) + '</div>' +
        '<p><strong>Categoría:</strong> ' + esc(p.cat) + '</p><p><strong>Material:</strong> ' + esc(p.material) + '</p></div>' +
        '<div class="compra-caja"><span class="stock">Stock disponible (' + stock + ')</span>' +
        '<div class="prod-fila"><span>Cantidad:</span><span class="cant"><button type="button" id="menos" aria-label="Menos">−</button><span id="cantN">' + cantidad + '</span><button type="button" id="mas" aria-label="Más">+</button></span></div>' +
        '<button type="button" class="btn-grande" id="comprar" style="padding:11px">Comprar ahora</button>' +
        '<button type="button" class="btn-grande" id="agregar" style="padding:11px;background:var(--rosa);color:var(--vino)">Agregar al carrito</button>' +
        '<p class="cupon-msg" id="aviso" style="margin:0"></p></div></section>' +
        '<div class="ficha"><section><h3>Características del producto</h3><table>' +
        '<tr><td>Marca</td><td>Fatob</td></tr><tr><td>Categoría</td><td>' + esc(p.cat) + '</td></tr><tr><td>Material</td><td>' + esc(p.material) + '</td></tr><tr><td>Origen</td><td>Argentina</td></tr></table></section>' +
        '<section><h3>Descripción</h3><p>' + esc(p.desc) + ' Ideal para tus recetas de todos los días.</p></section></div>' +
        '<h3 style="margin-top:26px">Productos relacionados</h3><div class="prod-grid">' + relacionados.map(function (r) {
            return '<article class="prod"><a class="prod-img" href="producto.html?id=' + r.id + '">' + imagenProducto(r) + '</a><h3><a href="producto.html?id=' + r.id + '">' + esc(r.nombre) + '</a></h3><span class="prod-precio">' + precio(r.precio) + '</span></article>';
        }).join('') + '</div>';

    document.getElementById('mas').addEventListener('click', function () { cantidad = Math.min(stock, cantidad + 1); document.getElementById('cantN').textContent = cantidad; });
    document.getElementById('menos').addEventListener('click', function () { cantidad = Math.max(1, cantidad - 1); document.getElementById('cantN').textContent = cantidad; });
    document.getElementById('agregar').addEventListener('click', function () {
        agregarAlCarrito(p.id, cantidad).then(function (r) {
            if (!r.ok) return;
            actualizarBurbujaCarrito();
            var a = document.getElementById('aviso'); a.style.color = '#2f5a22'; a.textContent = '✓ Agregado al carrito';
        });
    });
    document.getElementById('comprar').addEventListener('click', function () {
        agregarAlCarrito(p.id, cantidad).then(function (r) {
            if (!r.ok) return;
            location.href = usuarioActual() ? 'metodo_pago.html' : 'login.html?error=acceso&volver=metodo_pago.html';
        });
    });
}
dibujar();
