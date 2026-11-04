var cantidades = {};

function productoPorId(id) {
    return PRODUCTOS.find(function (p) {
        return p.id === id;
    });
}

function dibujarProductos() {
    document.getElementById('productos').innerHTML = PRODUCTOS.map(function (p) {
        var c = cantidades[p.id] || 1;
        return (
            '<article class="prod"><a class="prod-img" href="producto.html?id=' +
            p.id +
            '">' +
            imagenProducto(p) +
            '</a>' +
            '<h3><a href="producto.html?id=' +
            p.id +
            '">' +
            esc(p.nombre) +
            '</a></h3><p>' +
            esc(p.desc) +
            '</p>' +
            '<span class="prod-precio">' +
            precio(p.precio) +
            '</span>' +
            '<div class="prod-fila"><span class="cant"><button type="button" data-menos="' +
            p.id +
            '" aria-label="Menos">−</button><span>' +
            c +
            '</span><button type="button" data-mas="' +
            p.id +
            '" aria-label="Más">+</button></span>' +
            '<button type="button" class="btn-chico" data-agregar="' +
            p.id +
            '">Agregar</button></div></article>'
        );
    }).join('');
}

document.addEventListener('click', function (e) {
    var d = e.target.dataset;
    if (d.mas) {
        cantidades[d.mas] = (cantidades[d.mas] || 1) + 1;
        dibujarProductos();
    }
    if (d.menos) {
        cantidades[d.menos] = Math.max(1, (cantidades[d.menos] || 1) - 1);
        dibujarProductos();
    }
    if (d.agregar) {
        var id = parseInt(d.agregar, 10);
        agregarAlCarrito(id, cantidades[id] || 1).then(function (r) {
            if (!r.ok) return;
            cantidades[id] = 1;
            dibujarProductos();
            avisar('Producto agregado al carrito.');
        });
    }
});
dibujarProductos();
