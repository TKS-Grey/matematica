document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const generarBtn = $("generarBtn"), copiarBtn = $("copiarBtn"), valorB = $("valorB"), valorC = $("valorC");
    const formula = $("formula"), clasificacion = $("clasificacion"), mensaje = $("mensaje"), geogebraLink = $("geogebraLink");
    const archivoGGB = $("archivoGGB"), zonaGGB = $("zonaGGB"), nombreArchivo = $("nombreArchivo");
    const btnCargarGGB = $("btnCargarGGB"), mensajeGGB = $("mensajeGGB");

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

    let formulaActual = "f(x) = 0", geogebraApp = null, archivoSeleccionado = null;

    const rand = () => Math.floor(Math.random() * 7) - 3;

    const formatoFuncion = (b, c) => {
        if (!b && !c) return "f(x) = 0";
        if (!b) return `f(x) = ${c}`;
        const termB = b === 1 ? "x" : b === -1 ? "-x" : `${b}x`;
        return c ? `f(x) = ${termB} ${c > 0 ? "+" : "-"} ${Math.abs(c)}` : `f(x) = ${termB}`;
    };

    const comandoGeoGebra = (b, c) => `f(x)=${b}*x${c < 0 ? c : "+" + c}`;

    function clasificarFuncion(b, c) {
        Object.values(tipos).forEach(({ caja }) => caja.classList.replace("activa", "inactiva") || caja.classList.add("inactiva"));
        const clave = b ? (c ? "afin" : "lineal") : (c ? "constante" : "nula");
        const t = tipos[clave];

        clasificacion.textContent = t.titulo;
        t.caja.classList.remove("inactiva");
        t.caja.classList.add("activa");
        t.texto.textContent = typeof t.desc === "function" ? t.desc(c) : t.desc;
        mensaje.textContent = t.msg;
    }

    function generarFuncion() {
        const b = rand(), c = rand(), cmd = comandoGeoGebra(b, c);
        valorB.textContent = b;
        valorC.textContent = c;
        formulaActual = formatoFuncion(b, c);
        formula.textContent = formulaActual;
        clasificarFuncion(b, c);
        geogebraLink.href = `https://www.geogebra.org/classic?lang=es&command=${encodeURIComponent(cmd)}`;
        geogebraApp?.evalCommand(cmd);
    }

    generarBtn.addEventListener("click", generarFuncion);

    copiarBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(formulaActual);
            mensaje.textContent = "¡Función copiada correctamente!";
        } catch {
            mensaje.textContent = "No se pudo copiar. Comprueba los permisos del navegador.";
        }
    });

    if (typeof GGBApplet !== "undefined") {
        new GGBApplet({
            appName: "classic", width: 800, height: 450, showToolBar: true, showAlgebraInput: true,
            showMenuBar: true, showResetIcon: true, enableLabelDrags: false, enableShiftDragZoom: true,
            enableRightClick: true, useBrowserForJS: true,
            appletOnLoad: (api) => { geogebraApp = api; mensaje.textContent = "GeoGebra está listo para utilizarse."; }
        }, true).inject("ggb-element");
    } else {
        mensaje.textContent = "No se pudo cargar GeoGebra.";
    }

    function seleccionarArchivo(archivo) {
        if (!archivo) return;
        const valido = archivo.name.toLowerCase().endsWith(".ggb");
        archivoSeleccionado = valido ? archivo : null;
        btnCargarGGB.disabled = !valido;
        nombreArchivo.textContent = valido ? `Archivo seleccionado: ${archivo.name}` : "Ningún archivo seleccionado";
        mensajeGGB.textContent = valido ? "Archivo seleccionado correctamente." : "Selecciona un archivo con extensión .ggb.";
    }

    archivoGGB.addEventListener("change", () => seleccionarArchivo(archivoGGB.files[0]));
    zonaGGB.addEventListener("dragover", (e) => { e.preventDefault(); zonaGGB.classList.add("arrastrando"); });
    zonaGGB.addEventListener("dragleave", () => zonaGGB.classList.remove("arrastrando"));
    zonaGGB.addEventListener("drop", (e) => { e.preventDefault(); zonaGGB.classList.remove("arrastrando"); seleccionarArchivo(e.dataTransfer.files[0]); });




    
    btnCargarGGB.addEventListener("click", () => {
        if (!archivoSeleccionado) return;
        if (!geogebraApp) { mensajeGGB.textContent = "Espera a que GeoGebra termine de cargar."; return; }

        mensajeGGB.textContent = "Cargando construcción...";
        const lector = new FileReader();
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
        lector.onerror = () => { mensajeGGB.textContent = "Error al leer el archivo seleccionado."; };
        lector.readAsDataURL(archivoSeleccionado);
    });

    generarFuncion();
});
