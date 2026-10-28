function mostrarAviso(tipo, texto) {
    document.getElementById('aviso').innerHTML = '<div class="alert ' + tipo + '">' + texto + '</div>';
}
function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

var formLogin = document.getElementById('formLogin');
if (formLogin) {
    if (parametro('registro') === 'exito') mostrarAviso('success', '¡Cuenta creada con éxito! Ya podés ingresar.');
    if (parametro('clave') === 'ok') mostrarAviso('success', 'Contraseña actualizada. Ya podés iniciar sesión.');
    if (parametro('logout')) mostrarAviso('success', 'Sesión cerrada correctamente.');
    if (parametro('error') === 'acceso') mostrarAviso('error', 'Iniciá sesión para entrar a esa sección.');
    if (usuarioActual() && !parametro('logout')) location.href = 'index.html';

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('email').value.trim();
        var clave = document.getElementById('contrasena').value;
        if (!email || !clave) { mostrarAviso('error', 'Por favor completá todos los campos.'); return; }
        api('login', { email: email, clave: clave }).then(function (r) {
            if (!r.ok) return mostrarAviso('error', r.error);
            var volver = parametro('volver');
            location.href = /^[a-z_]+\.html$/.test(volver || '') ? volver : 'index.html';
        });
    });
}

var formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', function (e) {
        e.preventDefault();
        var nombre = document.getElementById('nombre').value.trim();
        var email = document.getElementById('email').value.trim();
        var clave = document.getElementById('contrasena').value;
        var verificar = document.getElementById('verificar').value;
        if (!nombre || !email || !clave || !verificar) return mostrarAviso('error', 'Por favor completá todos los campos.');
        if (!emailValido(email)) return mostrarAviso('error', 'Ingresá un correo electrónico válido.');
        if (clave.length < 6) return mostrarAviso('error', 'La contraseña debe tener al menos 6 caracteres.');
        if (clave !== verificar) return mostrarAviso('error', 'Las contraseñas no coinciden.');
        api('registro', { nombre: nombre, email: email, clave: clave }).then(function (r) {
            if (!r.ok) return mostrarAviso('error', r.error);
            location.href = esAdmin() ? 'usuario.html?msg=creado' : 'login.html?registro=exito';
        });
    });
}

var formRecuperar = document.getElementById('formRecuperar');
if (formRecuperar) {
    var emailRecuperar = '';
    formRecuperar.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('email').value.trim();
        if (!emailValido(email)) return mostrarAviso('error', 'Ingresá un correo electrónico válido.');
        api('recuperar_buscar', { email: email }).then(function (r) {
            if (!r.ok) return mostrarAviso('error', r.error);
            emailRecuperar = email;
            formRecuperar.style.display = 'none';
            document.getElementById('formNueva').style.display = 'flex';
            document.getElementById('subRecuperar').textContent = 'Creá tu nueva contraseña.';
            document.getElementById('aviso').innerHTML = '';
        });
    });
    document.getElementById('formNueva').addEventListener('submit', function (e) {
        e.preventDefault();
        var clave = document.getElementById('contrasena').value;
        if (clave.length < 6) return mostrarAviso('error', 'La contraseña debe tener al menos 6 caracteres.');
        if (clave !== document.getElementById('verificar').value) return mostrarAviso('error', 'Las contraseñas no coinciden.');
        api('recuperar_clave', { email: emailRecuperar, clave: clave }).then(function (r) {
            if (!r.ok) return mostrarAviso('error', r.error);
            location.href = 'login.html?clave=ok';
        });
    });
}
