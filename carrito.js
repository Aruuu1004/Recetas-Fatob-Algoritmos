function productoPorId(id) {
    return PRODUCTOS.find(function (p) {
        return p.id === id;
    });
}
function dibujarCarrito() {
    var items = leerCarrito(),
        lista = document.getElementById('carritoLista');
    lista.innerHTML = items.length
        ? items
              .map(function (i) {
                  var p = productoPorId(i.id);
                  if (!p) return '';
                  return (
                      '<div class="carrito-item"><span class="mini-img">' +
                      imagenProducto(p) +
                      '</span><div><strong>' +
                      esc(p.nombre) +
                      '</strong><small>' +
                      precio(p.precio) +
                      ' c/u</small><br><span class="cant"><button type="button" data-resta="' +
                      p.id +
                      '" aria-label="Quitar uno">−</button><span>' +
                      i.cant +
                      '</span><button type="button" data-suma="' +
                      p.id +
                      '" aria-label="Sumar uno">+</button></span></div><div class="item-total"><button type="button" class="borrar" data-borrar="' +
                      p.id +
                      '" aria-label="Quitar del carrito">×</button><br><strong>' +
                      precio(p.precio * i.cant) +
                      '</strong></div></div>'
                  );
              })
              .join('')
        : '<p class="carrito-vacio">Tu carrito está vacío.<br>¡Visitá la tienda para agregar utensilios!</p>';
    var n = cantidadCarrito(),
        sub = totalCarrito(),
        total = totalConDescuento();
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
    if (d.suma || d.resta || d.borrar) {
        var id = parseInt(d.suma || d.resta || d.borrar, 10),
            item = leerCarrito().find(function (x) {
                return x.id === id;
            });
        if (!item) return;
        var nueva = d.suma ? item.cant + 1 : d.resta ? item.cant - 1 : 0;
        accion('carrito_fijar', { id: id, cant: nueva }).then(dibujarCarrito);
    }
});
document.getElementById('btnVaciar').addEventListener('click', function () {
    if (!leerCarrito().length || !confirm('¿Vaciar el carrito?')) return;
    accion('carrito_vaciar').then(dibujarCarrito);
});
document.getElementById('formCupon').addEventListener('submit', function (e) {
    e.preventDefault();
    var codigo = document.getElementById('cuponInput').value.trim().toUpperCase(),
        msg = document.getElementById('cuponMsg');
    accion('cupon', { codigo: codigo }).then(function (r) {
        if (!r.ok) return;
        if (r.valido) {
            msg.style.color = '#2f5a22';
            msg.textContent = '¡Cupón aplicado! ' + r.porcentaje + '% de descuento.';
        } else {
            msg.style.color = '#8a1c1c';
            msg.textContent = 'Ese cupón no existe. Probá con FATOB10.';
        }
        dibujarCarrito();
    });
});
document.getElementById('btnContinuar').addEventListener('click', function () {
    if (!leerCarrito().length) {
        avisar('Tu carrito está vacío.');
        return;
    }
    location.href = usuarioActual() ? 'metodo_pago.html' : 'login.html?error=acceso&volver=metodo_pago.html';
});
dibujarCarrito();
