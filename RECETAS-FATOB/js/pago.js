
var pagina = location.pathname.split('/').pop();

if (pagina !== 'compra_exitosa.html') {
    if (!usuarioActual()) location.href = 'login.html?error=acceso&volver=' + pagina;
    else if (!leerCarrito().length) location.href = 'tienda.html';
}


function confirmarPedido(metodo) {
    return api('pedido_confirmar', { metodo: metodo }).then(function (r) {
        if (!r.ok) { alert(r.error); return false; }
        location.href = 'compra_exitosa.html';
        return true;
    });
}

if (pagina === 'metodo_pago.html') {
    document.getElementById('btnContinuar').addEventListener('click', function () {
        var m = document.querySelector('input[name="metodo"]:checked').value;
        location.href = m === 'tarjeta' ? 'pago_tarjeta.html' : 'pago_mercadopago.html';
    });
}

if (pagina === 'pago_tarjeta.html') {
    var numero = document.getElementById('numero');
    numero.addEventListener('input', function () {   
        numero.value = numero.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    function error(campo, texto) { document.getElementById('e-' + campo).textContent = texto; return texto !== ''; }

    document.getElementById('formTarjeta').addEventListener('submit', function (e) {
        e.preventDefault();
        var hayError = false;
        var digitos = numero.value.replace(/\s/g, '');
        hayError = error('numero', digitos.length < 13 ? 'Ingresá un número de tarjeta válido (13 a 16 dígitos).' : '') || hayError;
        hayError = error('titular', document.getElementById('titular').value.trim().length < 3 ? 'Ingresá el nombre como figura en la tarjeta.' : '') || hayError;
        hayError = error('cvv', /^\d{3,4}$/.test(document.getElementById('cvv').value) ? '' : 'El código tiene 3 o 4 números.') || hayError;

        var v = document.getElementById('venc').value.match(/^(\d{1,2})\/(\d{2})$/);
        var textoVenc = '';
        if (!v || v[1] < 1 || v[1] > 12) textoVenc = 'Usá el formato MM/AA (ej: 6/27).';
        else if (2000 + parseInt(v[2], 10) < new Date().getFullYear() || (2000 + parseInt(v[2], 10) === new Date().getFullYear() && v[1] < new Date().getMonth() + 1)) textoVenc = 'La tarjeta está vencida.';
        hayError = error('venc', textoVenc) || hayError;

        var dni = document.getElementById('dni').value.trim();
        hayError = error('dni', dni && !/^\d{7,8}$/.test(dni) ? 'El DNI tiene 7 u 8 números.' : '') || hayError;

        if (!hayError) confirmarPedido('tarjeta');
    });
}

if (pagina === 'pago_mercadopago.html') {
    document.getElementById('btnMP').addEventListener('click', function () {
        var boton = this, textoOriginal = boton.textContent;
        boton.textContent = 'Redirigiendo...'; boton.disabled = true;
        setTimeout(function () {
            confirmarPedido('mercadopago').then(function (ok) {
                if (!ok) { boton.textContent = textoOriginal; boton.disabled = false; }   
            });
        }, 1200);
    });
}

if (pagina === 'compra_exitosa.html') {
    var ped = leer('ultimoPedido', null);
    if (!ped) location.href = 'tienda.html';
    else {
        document.getElementById('rMetodo').textContent = ped.metodo;
        document.getElementById('rMonto').textContent = precio(ped.monto);
        document.getElementById('rNumero').textContent = '#' + (1000 + ped.id);
    }
}
