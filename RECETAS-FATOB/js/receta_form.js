if (exigirLogin()) iniciarFormulario();

function iniciarFormulario() {
    var yo = usuarioActual();
    var idEditar = parseInt(parametro('id'), 10) || 0;
    var recetas = leer('recetas', []);
    var receta = idEditar ? recetas.find(function (r) { return r.id === idEditar; }) : null;
    if (idEditar && (!receta || (yo.rol !== 1 && receta.autor !== yo.id))) { location.href = 'recetas.html'; return; }

    var selectCat = document.getElementById('categoria');
    selectCat.innerHTML = '<option value="" disabled selected>Elegí una categoría</option>' +
        CATEGORIAS.map(function (c) { return '<option value="' + c.id + '">' + c.nombre + '</option>'; }).join('');

    if (receta) {
        document.getElementById('tituloForm').textContent = 'Editar receta';
        document.getElementById('btnGuardar').textContent = 'Guardar cambios';
        document.getElementById('titulo').value = receta.titulo;
        selectCat.value = receta.cat;
        document.getElementById('descripcion').value = receta.desc;
        document.getElementById('ingredientes').value = receta.ingredientes.join('\n');
        document.getElementById('pasos').value = receta.pasos.join('\n');
        document.getElementById('tiempo').value = receta.tiempo;
    }

    function leerFoto(archivo, listo) {
        var lector = new FileReader();
        lector.onload = function () {
            var img = new Image();
            img.onload = function () {
                var escala = Math.min(1, 700 / Math.max(img.width, img.height));
                var canvas = document.createElement('canvas');
                canvas.width = img.width * escala; canvas.height = img.height * escala;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                listo(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = lector.result;
        };
        lector.readAsDataURL(archivo);
    }

    function lineas(id) {
        return document.getElementById(id).value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    }

    document.getElementById('formReceta').addEventListener('submit', function (e) {
        e.preventDefault();
        var aviso = document.getElementById('msgError');
        var datos = {
            titulo: document.getElementById('titulo').value.trim(),
            cat: parseInt(selectCat.value, 10),
            desc: document.getElementById('descripcion').value.trim(),
            ingredientes: lineas('ingredientes'),
            pasos: lineas('pasos'),
            tiempo: parseInt(document.getElementById('tiempo').value, 10)
        };
        if (!datos.titulo || !datos.cat || !datos.desc || !datos.ingredientes.length || !datos.pasos.length || !(datos.tiempo > 0)) {
            aviso.textContent = 'Completá todos los campos obligatorios.'; aviso.style.display = 'block'; return;
        }
        var archivo = document.getElementById('foto').files[0];

        var boton = document.getElementById('btnGuardar');
        function terminar(foto) {
            boton.disabled = true;   
            api('receta_guardar', Object.assign({ id: receta ? receta.id : 0, foto: foto || '' }, datos)).then(function (r) {
                if (!r.ok) { boton.disabled = false; aviso.textContent = r.error; aviso.style.display = 'block'; return; }
                location.href = 'receta_detalle.html?id=' + r.id + (receta ? '&msg=editada' : '');
            });
        }
        if (archivo) leerFoto(archivo, terminar); else terminar(null);
    });
}
