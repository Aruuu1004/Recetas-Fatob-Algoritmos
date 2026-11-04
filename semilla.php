<?php


const SEMILLA_EMAIL = 'equipo@recetasfatob.local';
const SEMILLA_MARCA = '-- @@SEMILLA@@';

function dividirSql($sql) {
    $out = []; $cur = ''; $enTexto = false; $n = strlen($sql);
    for ($i = 0; $i < $n; $i++) {
        $c = $sql[$i];
        if ($enTexto) {
            $cur .= $c;
            if ($c === '\\' && $i + 1 < $n) { $cur .= $sql[++$i]; continue; }
            if ($c === "'") {
                if ($i + 1 < $n && $sql[$i + 1] === "'") { $cur .= $sql[++$i]; continue; }
                $enTexto = false;
            }
            continue;
        }
        if ($c === "'") { $enTexto = true; $cur .= $c; continue; }
        if ($c === '-' && $i + 1 < $n && $sql[$i + 1] === '-') {
            $f = strpos($sql, "\n", $i);
            if ($f === false) break;
            $i = $f; $cur .= "\n"; continue;
        }
        if ($c === ';') { if (trim($cur) !== '') $out[] = trim($cur); $cur = ''; continue; }
        $cur .= $c;
    }
    if (trim($cur) !== '') $out[] = trim($cur);
    return $out;
}

function sembrarEjemplos($pdo) {
    try {
        $existe = function () use ($pdo) {
            $st = $pdo->prepare('SELECT 1 FROM USUARIO WHERE email = ?');
            $st->execute([SEMILLA_EMAIL]);
            if (!$st->fetchColumn()) return false;
            return (bool)$pdo->query('SELECT 1 FROM RECETA LIMIT 1')->fetchColumn();
        };
        if ($existe()) { actualizarFotosEjemplo($pdo); return; }

        $sql = @file_get_contents(dirname(__DIR__) . '/base_de_datos/recetas_fatob.sql');
        if ($sql === false) return;
        $i = strpos($sql, SEMILLA_MARCA);
        if ($i === false) $i = strpos($sql, "INSERT IGNORE INTO USUARIO (id_rol, nombre, email, contrasena) VALUES (2, 'Equipo FATOB'");
        if ($i === false) return;

        $pdo->query("SELECT GET_LOCK('fatob_semilla', 10)")->fetchColumn();
        try {
            if ($existe()) return;
            foreach (dividirSql(substr($sql, $i)) as $sentencia) $pdo->exec($sentencia);
        } finally {
            $pdo->query("SELECT RELEASE_LOCK('fatob_semilla')")->fetchColumn();
        }
    } catch (Throwable $e) {
        error_log('[FATOB] No se pudieron cargar las recetas de ejemplo: ' . $e->getMessage());
    }
}

function actualizarFotosEjemplo($pdo) {
    try {
        $prod = $pdo->prepare("UPDATE PRODUCTO SET imagen = ? WHERE id_producto = ? AND imagen = ?");
        foreach (['1' => ['medidor.svg', 'Medidor multiusos.jpg'], '2' => ['mortero.svg', 'Mortero.jpg'], '3' => ['rallador.svg', 'Rallador.jpg'], '4' => ['cucharon.svg', 'Cucharon.jpg'], '5' => ['cuchillo.svg', 'Cuchillo.jpg'], '6' => ['batidora-pie.svg', 'Batidora Electrica.jpg'], '7' => ['batidor.svg', 'Batidora manual.jpg'], '8' => ['tabla.svg', 'Tabla madera cortar.jpg'], '9' => ['cafetera.svg', 'Cafetera.jpg'], '11' => ['palo-amasar.svg', 'Rodillo.jpg'], '12' => ['tostadora.svg', 'Tostadora.jpg'], '13' => ['batidora-mano.svg', 'Batidora.jpg'], '14' => ['olla.svg', 'Olla.jpg'], '15' => ['sarten.svg', 'Sarten.jpg'], '16' => ['kit-cuchillos.svg', 'Kit cuchillos.jpg'], '17' => ['bowl.svg', 'Bowl.jpg'], '18' => ['pelador.svg', 'Pelador.jpg'], '19' => ['colador.svg', 'Colador.jpg'], '20' => ['pincel.svg', 'Pincel silicona.jpg']] as $id => [$viejo, $nuevo]) {
            $prod->execute([$nuevo, (int)$id, $viejo]);
        }
        $pdo->prepare("UPDATE PRODUCTO SET imagen = 'Wok.webp' WHERE id_producto = 10 AND (imagen IS NULL OR imagen = 'wok.svg')")->execute();
        $st = $pdo->prepare("UPDATE RECETA SET imagen = ? WHERE imagen = ?");
        foreach (glob(dirname(__DIR__) . '/img/recetas/ejemplo_*.*') as $ruta) {
            $nombre = basename($ruta);
            $base = pathinfo($nombre, PATHINFO_FILENAME);
            foreach (['svg', 'jpg', 'jpeg', 'png', 'webp', 'avif'] as $ext) {
                if ($base . '.' . $ext !== $nombre) $st->execute([$nombre, $base . '.' . $ext]);
            }
        }
    } catch (Throwable $e) {
        error_log('[FATOB] No se pudieron actualizar las fotos de ejemplo: ' . $e->getMessage());
    }
}
