
(function () {
    function cerrarMenu() {
        var nav = document.getElementById('navbar');
        var btn = document.getElementById('navToggle');
        if (nav) nav.classList.remove('abierto');
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menú');
        }
    }

    document.addEventListener('click', function (e) {
        var nav = document.getElementById('navbar');
        if (!nav) return;

        var btn = e.target.closest('#navToggle');
        if (btn) {
            var abierto = nav.classList.toggle('abierto');
            btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
            btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
            return;
        }

        var det = nav.querySelector('details.nav-user');
        if (det && det.open && !det.contains(e.target)) det.open = false;
        if (nav.classList.contains('abierto') && !nav.contains(e.target)) cerrarMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var nav = document.getElementById('navbar');
        if (!nav) return;
        var det = nav.querySelector('details.nav-user');
        if (det) det.open = false;
        cerrarMenu();
    });
})();
