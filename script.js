document.addEventListener("DOMContentLoaded", () => {

    const generarBtn = document.getElementById("generarBtn");
    const copiarBtn = document.getElementById("copiarBtn");
    const valorB = document.getElementById("valorB");
    const valorC = document.getElementById("valorC");
    const formula = document.getElementById("formula");
    const clasificacion = document.getElementById("clasificacion");
    const mensaje = document.getElementById("mensaje");
    const geogebraLink = document.getElementById("geogebraLink");
    const cajas = {
        lineal: document.getElementById("cajaLineal"),
        afin: document.getElementById("cajaAfin"),
        constante: document.getElementById("cajaConstante"),
        nula: document.getElementById("cajaNula")
    };

    const textos = {
        lineal: document.getElementById("textoLineal"),
        afin: document.getElementById("textoAfin"),
        constante: document.getElementById("textoConstante"),
        nula: document.getElementById("textoNula")
    };

    let formulaActual = "f(x) = 0";
    let geogebraApp = null;


    function numeroAleatorio() {
        return Math.floor(Math.random() * 7) - 3;
    }

    function formatoFuncion(b, c) {
        if (b === 0 && c === 0) {
            return "f(x) = 0";
        }

        if (b === 0) {
            return `f(x) = ${c}`;
        }

        let terminoB = b === 1 ? "x" :
                       b === -1 ? "-x" : `${b}x`;

        if (c === 0) {
            return `f(x) = ${terminoB}`;
        }

        return `f(x) = ${terminoB} ${c > 0 ? "+" : "-"} ${Math.abs(c)}`;
    }

    function comandoGeoGebra(b, c) {
        return `f(x)=${b}*x${c < 0 ? c : "+" + c}`;
    }

    function clasificarFuncion(b, c) {

        Object.values(cajas).forEach(caja => {
            caja.classList.remove("activa");
            caja.classList.add("inactiva");
        });

        if (b !== 0 && c === 0) {

            clasificacion.textContent = "Clasificación: FUNCIÓN LINEAL";

            cajas.lineal.classList.add("activa");
            cajas.lineal.classList.remove("inactiva");

            textos.lineal.textContent =
                "La función tiene la forma f(x) = bx. " +
                "Pasa por el origen y su pendiente es distinta de cero.";

            mensaje.textContent = "La función es lineal.";

        } else if (b !== 0 && c !== 0) {

            clasificacion.textContent = "Clasificación: FUNCIÓN AFÍN";

            cajas.afin.classList.add("activa");
            cajas.afin.classList.remove("inactiva");

            textos.afin.textContent =
                "La función tiene la forma f(x) = bx + c. " +
                "Su pendiente y su término independiente son distintos de cero.";

            mensaje.textContent = "La función es afín.";

        } else if (b === 0 && c !== 0) {

            clasificacion.textContent = "Clasificación: FUNCIÓN CONSTANTE";

            cajas.constante.classList.add("activa");
            cajas.constante.classList.remove("inactiva");

            textos.constante.textContent =
                `La función siempre toma el valor ${c}. ` +
                "Su gráfica es una recta horizontal.";

            mensaje.textContent = "La función es constante.";

        } else {

            clasificacion.textContent = "CLASIFICACIÓN: FUNCIÓN NULA";

            cajas.nula.classList.add("activa");
            cajas.nula.classList.remove("inactiva");

            textos.nula.textContent =
                "La función siempre tiene un resultado igual a cero. " +
                "Su gráfica coincide con el eje X.";

            mensaje.textContent = "La función es nula.";
        }
    }

    function generarFuncion() {

        const b = numeroAleatorio();
        const c = numeroAleatorio();
        valorB.textContent = b;
        valorC.textContent = c;
        formulaActual = formatoFuncion(b, c);
        formula.textContent = formulaActual;
        clasificarFuncion(b, c);
        const comando = comandoGeoGebra(b, c);
        geogebraLink.href =
            "https://www.geogebra.org/classic?lang=es&command=" +
            encodeURIComponent(comando);

        if (geogebraApp) {
            geogebraApp.evalCommand(comando);
        }
    }

    generarBtn.addEventListener("click", generarFuncion);

    // ===== COPIAR FUNCIÓN =====

    copiarBtn.addEventListener("click", async () => {

        try {
            await navigator.clipboard.writeText(formulaActual);
            mensaje.textContent = "¡Función copiada correctamente!";
        } catch (error) {
            mensaje.textContent =
                "No se pudo copiar. Comprueba los permisos del navegador.";
        }
    });

    if (typeof GGBApplet !== "undefined") {
        const parametros = {
            appName: "classic",
            width: 800,
            height: 450,
            showToolBar: true,
            showAlgebraInput: true,
            showMenuBar: true,
            showResetIcon: true,
            enableLabelDrags: false,
            enableShiftDragZoom: true,
            enableRightClick: true,
            useBrowserForJS: true,
            appletOnLoad: function(api) {
                geogebraApp = api;
                mensaje.textContent =
                    "GeoGebra está listo para utilizarse.";
            }
        };
        const applet = new GGBApplet(parametros, true);
        applet.inject("ggb-element");
    } else {
        mensaje.textContent = "No se pudo cargar GeoGebra.";
    }

    const archivoGGB = document.getElementById("archivoGGB");
    const zonaGGB = document.getElementById("zonaGGB");
    const nombreArchivo = document.getElementById("nombreArchivo");
    const btnCargarGGB = document.getElementById("btnCargarGGB");
    const mensajeGGB = document.getElementById("mensajeGGB");

    let archivoSeleccionado = null;

    function seleccionarArchivo(archivo) {

        if (!archivo) return;

        if (!archivo.name.toLowerCase().endsWith(".ggb")) {

            mensajeGGB.textContent =
                "Selecciona un archivo con extensión .ggb.";

            archivoSeleccionado = null;
            btnCargarGGB.disabled = true;

            nombreArchivo.textContent =
                "Ningún archivo seleccionado";

            return;
        }

        archivoSeleccionado = archivo;

        nombreArchivo.textContent =
            "Archivo seleccionado: " + archivo.name;

        mensajeGGB.textContent =
            "Archivo seleccionado correctamente.";

        btnCargarGGB.disabled = false;
    }

    archivoGGB.addEventListener("change", () => {
        seleccionarArchivo(archivoGGB.files[0]);
    });

    zonaGGB.addEventListener("dragover", (e) => {
        e.preventDefault();
        zonaGGB.classList.add("arrastrando");
    });

    zonaGGB.addEventListener("dragleave", () => {
        zonaGGB.classList.remove("arrastrando");
    });
    zonaGGB.addEventListener("drop", (e) => {
        e.preventDefault();
        zonaGGB.classList.remove("arrastrando");
        seleccionarArchivo(e.dataTransfer.files[0]);
    });

    btnCargarGGB.addEventListener("click", () => {
        if (!archivoSeleccionado) return;
        if (!geogebraApp) {

            mensajeGGB.textContent =
                "Espera a que GeoGebra termine de cargar.";

            return;
        }
        mensajeGGB.textContent =
            "Cargando construcción...";
        const lector = new FileReader();
        lector.onload = function(e) {
            try {
                const base64 = e.target.result.split(",")[1];
                geogebraApp.setBase64(base64, function() {
                    mensajeGGB.textContent =
                        "¡Construcción cargada correctamente!";
                    document.getElementById("ggb-element")
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                });
            } catch (error) {
                mensajeGGB.textContent =
                    "No se pudo importar el archivo.";
            }
        };
        lector.onerror = function() {

            mensajeGGB.textContent =
                "Error al leer el archivo seleccionado.";
        };
        lector.readAsDataURL(archivoSeleccionado);
    });

    generarFuncion();

});
