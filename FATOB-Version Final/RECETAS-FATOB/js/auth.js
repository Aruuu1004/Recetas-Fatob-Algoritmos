(function () {
    document.querySelectorAll('input[data-mostrar]').forEach(function (chk) {
        chk.addEventListener('change', function () {
            chk.getAttribute('data-mostrar').split(',').forEach(function (id) {
                var campo = document.getElementById(id.trim());
                if (campo) campo.type = chk.checked ? 'text' : 'password';
            });
        });
    });
})();
