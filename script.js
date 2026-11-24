// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
    // Atajo para obtener elementos del DOM por su id
    const $ = (id) => document.getElementById(id);

    // Referencias a controles, salidas y mensajes de la interfaz principal
    const generarBtn = $("generarBtn"), copiarBtn = $("copiarBtn"), valorB = $("valorB"), valorC = $("valorC");
    const formula = $("formula"), clasificacion = $("clasificacion"), mensaje = $("mensaje"), geogebraLink = $("geogebraLink");
    // Referencias a elementos relacionados con la importación de archivos .ggb
    const archivoGGB = $("archivoGGB"), zonaGGB = $("zonaGGB"), nombreArchivo = $("nombreArchivo");
    const btnCargarGGB = $("btnCargarGGB"), mensajeGGB = $("mensajeGGB");

    // Diccionario con títulos, descripciones, mensajes y elementos TIPO de función
    const tipos = {
        lineal: {
            titulo: "Clasificación: FUNCIÓN LINEAL",
            desc: "La función tiene la forma f(x) = bx. Pasa por el origen y su pendiente es distinta de cero.",
            msg: "La función es lineal.",
            caja: $("cajaLineal"),
            texto: $("textoLineal")
        },
        afin: {
            titulo: "Clasificación: FUNCIÓN AFÍN",
            desc: "La función tiene la forma f(x) = bx + c. Su pendiente y su término independiente son distintos de cero.",
            msg: "La función es afín.",
            caja: $("cajaAfin"),
            texto: $("textoAfin")
        },
        constante: {
            titulo: "Clasificación: FUNCIÓN CONSTANTE",
            // Función dinámica para insertar el valor actual de c
            desc: (c) => `La función siempre toma el valor ${c}. Su gráfica es una recta horizontal.`,
            msg: "La función es constante.",
            caja: $("cajaConstante"),
            texto: $("textoConstante")
        },
        nula: {
            titulo: "CLASIFICACIÓN: FUNCIÓN NULA",
            desc: "La función siempre tiene un resultado igual a cero. Su gráfica coincide con el eje X.",
            msg: "La función es nula.",
            caja: $("cajaNula"),
            texto: $("textoNula")
        }
    };

    // Variables de estado de la aplicación
    let formulaActual = "f(x) = 0", geogebraApp = null, archivoSeleccionado = null;

    // Genera un número entero aleatorio entre -3 y 3 (inclusive)
    const rand = () => Math.floor(Math.random() * 7) - 3;

    // Construye la fórmula legible evitando redundancias como 1x, -1x o "+ -"
    const formatoFuncion = (b, c) => {
        if (!b && !c) return "f(x) = 0";
        if (!b) return `f(x) = ${c}`;
        const termB = b === 1 ? "x" : b === -1 ? "-x" : `${b}x`;
        return c ? `f(x) = ${termB} ${c > 0 ? "+" : "-"} ${Math.abs(c)}` : `f(x) = ${termB}`;
    };

    // Construye el comando algebraico para enviar a GeoGebra
    const comandoGeoGebra = (b, c) => `f(x)=${b}*x${c < 0 ? c : "+" + c}`;

    // Determina el tipo de función según b y c y actualiza las tarjetas visuales
    function clasificarFuncion(b, c) {
        // Marca todas las cajas como inactivas antes de activar la correspondiente
        Object.values(tipos).forEach(({ caja }) => caja.classList.replace("activa", "inactiva") || caja.classList.add("inactiva"));
        // Selecciona la clave según si b y c son distintos de cero
        const clave = b ? (c ? "afin" : "lineal") : (c ? "constante" : "nula");
        const t = tipos[clave];

        // Actualiza título, estilos de la tarjeta activa, descripción y mensaje
        clasificacion.textContent = t.titulo;
        t.caja.classList.remove("inactiva");
        t.caja.classList.add("activa");
        t.texto.textContent = typeof t.desc === "function" ? t.desc(c) : t.desc;
        mensaje.textContent = t.msg;
    }

    // Genera nuevos coeficientes aleatorios y actualiza la vista, el enlace y GeoGebra
    function generarFuncion() {
        const b = rand(), c = rand(), cmd = comandoGeoGebra(b, c);
        valorB.textContent = b;
        valorC.textContent = c;
        formulaActual = formatoFuncion(b, c);
        formula.textContent = formulaActual;
        clasificarFuncion(b, c);
        // Actualiza el enlace externo codificando el comando para la URL
        geogebraLink.href = `https://www.geogebra.org/classic?lang=es&command=${encodeURIComponent(cmd)}`;
        // Si el applet ya cargó, evalúa el comando directamente en el visor
        geogebraApp?.evalCommand(cmd);
    }

    // Evento al pulsar el botón para generar una nueva función
    generarBtn.addEventListener("click", generarFuncion);

    // Evento al pulsar el botón para copiar la fórmula actual al portapapeles
    copiarBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(formulaActual);
            mensaje.textContent = "¡Función copiada correctamente!";
        } catch {
            mensaje.textContent = "No se pudo copiar. Comprueba los permisos del navegador.";
        }
    });

    // Inicializa el applet de GeoGebra si la librería está disponible
    if (typeof GGBApplet !== "undefined") {
        new GGBApplet({
            appName: "classic", width: 800, height: 450, showToolBar: true, showAlgebraInput: true,
            showMenuBar: true, showResetIcon: true, enableLabelDrags: false, enableShiftDragZoom: true,
            enableRightClick: true, useBrowserForJS: true,
            // Guarda la API del applet cuando termina de cargarse
            appletOnLoad: (api) => { geogebraApp = api; mensaje.textContent = "GeoGebra está listo para utilizarse."; }
        }, true).inject("ggb-element");
    } else {
        mensaje.textContent = "No se pudo cargar GeoGebra.";
    }

    // Valida que el archivo tenga extensión .ggb y actualiza el estado y textos
    function seleccionarArchivo(archivo) {
        if (!archivo) return;
        const valido = archivo.name.toLowerCase().endsWith(".ggb");
        archivoSeleccionado = valido ? archivo : null;
        btnCargarGGB.disabled = !valido;
        nombreArchivo.textContent = valido ? `Archivo seleccionado: ${archivo.name}` : "Ningún archivo seleccionado";
        mensajeGGB.textContent = valido ? "Archivo seleccionado correctamente." : "Selecciona un archivo con extensión .ggb.";
    }

    // Escucha cambios en el selector de archivos
    archivoGGB.addEventListener("change", () => seleccionarArchivo(archivoGGB.files[0]));
    // Resalta la zona cuando se arrastra un archivo encima
    zonaGGB.addEventListener("dragover", (e) => { e.preventDefault(); zonaGGB.classList.add("arrastrando"); });
    // Quita el resaltado al salir de la zona
    zonaGGB.addEventListener("dragleave", () => zonaGGB.classList.remove("arrastrando"));
    // Procesa el archivo soltado en la zona
    zonaGGB.addEventListener("drop", (e) => { e.preventDefault(); zonaGGB.classList.remove("arrastrando"); seleccionarArchivo(e.dataTransfer.files[0]); });





    // Lee el archivo .ggb seleccionado en Base64 y lo importa en GeoGebra
    btnCargarGGB.addEventListener("click", () => {
        if (!archivoSeleccionado) return;
        if (!geogebraApp) { mensajeGGB.textContent = "Espera a que GeoGebra termine de cargar."; return; }

        mensajeGGB.textContent = "Cargando construcción...";
        const lector = new FileReader();
        // Cuando termina la lectura, extrae el contenido Base64 tras la coma y lo carga en GeoGebra
        lector.onload = (e) => {
            try {
                geogebraApp.setBase64(e.target.result.split(",")[1], () => {
                    mensajeGGB.textContent = "¡Construcción cargada correctamente!";
                    $("ggb-element").scrollIntoView({ behavior: "smooth", block: "center" });
                });
            } catch {
                mensajeGGB.textContent = "No se pudo importar el archivo.";
            }
        };
        // Maneja errores de lectura del archivo
        lector.onerror = () => { mensajeGGB.textContent = "Error al leer el archivo seleccionado."; };
        // Inicia la lectura del archivo como Data URL (Base64)
        lector.readAsDataURL(archivoSeleccionado);
    });

    // Genera una función inicial al cargar la página
    generarFuncion();
});
