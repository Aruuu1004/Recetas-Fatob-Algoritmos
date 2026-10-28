var cantidades = {};   

function productoPorId(id) { return PRODUCTOS.find(function (p) { return p.id === id; }); }

function dibujarProductos() {
    document.getElementById('productos').innerHTML = PRODUCTOS.map(function (p) {
        var c = cantidades[p.id] || 1;
        return '<article class="prod"><a class="prod-img" href="producto.html?id=' + p.id + '">' + imagenProducto(p) + '</a>' +
            '<h3><a href="producto.html?id=' + p.id + '">' + esc(p.nombre) + '</a></h3><p>' + esc(p.desc) + '</p>' +
            '<span class="prod-precio">' + precio(p.precio) + '</span>' +
            '<div class="prod-fila"><span class="cant"><button type="button" data-menos="' + p.id + '" aria-label="Menos">−</button><span>' + c + '</span><button type="button" data-mas="' + p.id + '" aria-label="Más">+</button></span>' +
            '<button type="button" class="btn-chico" data-agregar="' + p.id + '">Agregar</button></div></article>';
    }).join('');
}

function dibujarCarrito() {
    var items = leerCarrito();
    var lista = document.getElementById('carritoLista');
    lista.innerHTML = items.length ? items.map(function (i) {
        var p = productoPorId(i.id);
        return '<div class="carrito-item"><span class="mini-img">' + '<img src="img/productos/' + p.imagen + '" alt="">' + '</span>' +
            '<div><strong>' + esc(p.nombre) + '</strong><small>' + precio(p.precio) + ' c/u</small><br>' +
            '<span class="cant"><button type="button" data-resta="' + p.id + '" aria-label="Quitar uno">−</button><span>' + i.cant + '</span><button type="button" data-suma="' + p.id + '" aria-label="Sumar uno">+</button></span></div>' +
            '<div style="text-align:right"><button type="button" class="borrar" data-borrar="' + p.id + '" aria-label="Quitar del carrito">🗑</button><br><strong>' + precio(p.precio * i.cant) + '</strong></div></div>';
    }).join('') : '<p class="carrito-vacio">Tu carrito está vacío.<br>¡Agregá algún utensilio!</p>';

    var n = cantidadCarrito(), sub = totalCarrito(), total = totalConDescuento();
    document.getElementById('carritoCuenta').textContent = n + (n === 1 ? ' producto' : ' productos');
    document.getElementById('resCuenta').textContent = 'Subtotal (' + n + (n === 1 ? ' producto)' : ' productos)');
    document.getElementById('resSubtotal').textContent = precio(sub);
    var cupon = leer('cupon', null);
    document.getElementById('filaDesc').style.display = cupon ? 'flex' : 'none';
    if (cupon) {
        document.getElementById('resDescTxt').textContent = 'Cupón ' + cupon + ' (-' + CUPONES[cupon] + '%)';
        document.getElementById('resDesc').textContent = '-' + precio(sub - total);
    }
    document.getElementById('resTotal').textContent = precio(total);
    actualizarBurbujaCarrito();
}

document.addEventListener('click', function (e) {
    var d = e.target.dataset;
    if (d.mas) { cantidades[d.mas] = (cantidades[d.mas] || 1) + 1; dibujarProductos(); }
    if (d.menos) { cantidades[d.menos] = Math.max(1, (cantidades[d.menos] || 1) - 1); dibujarProductos(); }
    if (d.agregar) {
        var id = parseInt(d.agregar, 10);
        agregarAlCarrito(id, cantidades[id] || 1).then(function (r) {
            if (!r.ok) return;
            cantidades[id] = 1; dibujarProductos(); dibujarCarrito();
        });
    }
    if (d.suma || d.resta || d.borrar) {
        var id2 = parseInt(d.suma || d.resta || d.borrar, 10);
        var item = leerCarrito().find(function (x) { return x.id === id2; });
        var nueva = d.suma ? item.cant + 1 : d.resta ? item.cant - 1 : 0;   
        accion('carrito_fijar', { id: id2, cant: nueva }).then(function () { dibujarCarrito(); });
    }
});

document.getElementById('btnVaciar').addEventListener('click', function () {
    if (!leerCarrito().length || !confirm('¿Vaciar el carrito?')) return;
    accion('carrito_vaciar').then(function () { dibujarCarrito(); });
});

document.getElementById('formCupon').addEventListener('submit', function (e) {
    e.preventDefault();
    var codigo = document.getElementById('cuponInput').value.trim().toUpperCase();
    var msg = document.getElementById('cuponMsg');
    accion('cupon', { codigo: codigo }).then(function (r) {
        if (!r.ok) return;
        if (r.valido) { msg.style.color = '#2f5a22'; msg.textContent = '¡Cupón aplicado! ' + r.porcentaje + '% de descuento.'; }
        else { msg.style.color = '#8a1c1c'; msg.textContent = 'Ese cupón no existe. Probá con FATOB10.'; }
        dibujarCarrito();
    });
});

document.getElementById('btnContinuar').addEventListener('click', function () {
    if (!leerCarrito().length) { alert('Tu carrito está vacío.'); return; }
    location.href = usuarioActual() ? 'metodo_pago.html' : 'login.html?error=acceso&volver=metodo_pago.html';
});

dibujarProductos();
dibujarCarrito();
