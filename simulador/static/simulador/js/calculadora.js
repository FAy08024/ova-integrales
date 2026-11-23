setTimeout(() => {
    formulario.requestSubmit();
}, 300);
document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById(
        "form-calculadora"
    );

    const contenedorResultado = document.getElementById(
        "resultado-integral"
    );

    if (!formulario || !contenedorResultado) {
        console.error("No se encontró el formulario.");
        return;
    }


/* ========================================
   MOVIMIENTO DEL ROUTER WI-FI
======================================== */

const routerX = document.getElementById("router-x");
const routerY = document.getElementById("router-y");

const valorRouterX = document.getElementById("valor-router-x");
const valorRouterY = document.getElementById("valor-router-y");

const coordenadasRouter = document.getElementById(
    "coordenadas-router"
);

const campoFuncion = document.getElementById("funcion");
let temporizadorCalculo = null;

function calcularAutomaticamente() {
    if (!formulario) {
        return;
    }

    clearTimeout(temporizadorCalculo);

    temporizadorCalculo = setTimeout(() => {
        formulario.requestSubmit();
    }, 400);
}
function actualizarRouter() {

    if (
        !routerX ||
        !routerY ||
        !valorRouterX ||
        !valorRouterY ||
        !coordenadasRouter ||
        !campoFuncion
    ) {
        console.error("Falta un elemento del router en el HTML.");
        return;
    }

    const x = Number(routerX.value);
    const y = Number(routerY.value);

    // Actualizar metros
    valorRouterX.textContent = `${x} m`;
    valorRouterY.textContent = `${y} m`;

    // Actualizar coordenadas
    coordenadasRouter.textContent = `(${x}, ${y})`;

    // Actualizar función matemática
    campoFuncion.value =
        `-40-(x-${x})**2-(y-${y})**2`;
}

// Ejecutar al mover cualquiera de los sliders
if (routerX && routerY) {

    function moverRouterTiempoReal() {
        actualizarRouter();
        calcularAutomaticamente();
    }

    routerX.addEventListener("input", moverRouterTiempoReal);
    routerY.addEventListener("input", moverRouterTiempoReal);

    actualizarRouter();
}


    function mostrarResultado(titulo, mensaje) {
        contenedorResultado.replaceChildren();

        const h3 = document.createElement("h3");
        h3.textContent = titulo;

        const p = document.createElement("p");
        p.textContent = mensaje;

        contenedorResultado.append(h3, p);
    }

    
    function dibujarGrafica(grafica) {

        const contenedor = document.getElementById("grafica-2d");

        if (!contenedor || typeof Plotly === "undefined") {
            console.warn("Plotly no está disponible.");
            return;
        }

        // Coordenadas actuales del router
        const xRouter = Number(routerX.value);
        const yRouter = Number(routerY.value);

        // Distribución de la señal Wi-Fi
        const mapaSenal = {
            x: grafica.x,
            y: grafica.y,
            z: grafica.z,
            type: "contour",
            colorscale: "Viridis",
            contours: {
                coloring: "heatmap",
                showlines: true
            },
            colorbar: {
                title: "Señal (dBm)"
            },
            name: "Señal Wi-Fi"
        };

        // Marcador de la posición del router
        const marcadorRouter = {
            x: [xRouter],
            y: [yRouter],
            type: "scatter",
            mode: "markers+text",
            text: [`Router (${xRouter}, ${yRouter})`],
            textposition: "top right",
            marker: {
                color: "#dc3545",
                size: 13,
                line: {
                color: "#ffffff",
                width: 2
                }
            },
            name: "Router",
            hovertemplate:
                "Router Wi-Fi<br>" +
                "X: %{x} m<br>" +
                "Y: %{y} m<extra></extra>"
        };

        Plotly.react(
            contenedor,
            [mapaSenal, marcadorRouter],
            {
                title: {
                    text: "Distribución de señal Wi-Fi"
                },
                xaxis: {
                    title: { text: "X (m)" }
                },
                yaxis: {
                    title: { text: "Y (m)" },
                    scaleanchor: "x"
                },
                margin: {
                    l: 55,
                    r: 35,
                    t: 60,
                 b: 55
                },
                showlegend: false
            },
            {
                responsive: true,
                displaylogo: false
            }
        );
    }


    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const boton = formulario.querySelector(
            'button[type="submit"]'
        );

        const datos = new FormData(formulario);

        
        const integral = {
            tipo: "doble",
            coordenadas: "cartesianas",
            funcion: datos.get("funcion"),
            orden: datos.get("orden"),
            x_min: datos.get("x_min"),
            x_max: datos.get("x_max"),
            y_min: datos.get("y_min"),
            y_max: datos.get("y_max")
        };


        boton.disabled = true;

        mostrarResultado(
            "Calculando...",
            "Procesando integral."
        );

        try {
            const respuesta = await fetch(
                formulario.dataset.url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": datos.get(
                            "csrfmiddlewaretoken"
                        )
                    },
                    body: JSON.stringify(integral)
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.error || "Error del servidor."
                );
            }

            
// Obtener los límites del formulario
const xMin = Number(datos.get("x_min"));
const xMax = Number(datos.get("x_max"));
const yMin = Number(datos.get("y_min"));
const yMax = Number(datos.get("y_max"));

// Calcular el área rectangular
const area = (xMax - xMin) * (yMax - yMin);

// Obtener el resultado decimal de Python
const valorIntegral = Number(resultado.decimal);

// Calcular el promedio espacial
const promedio = valorIntegral / area;

// Limpiar el resultado anterior
contenedorResultado.replaceChildren();

// Título
const titulo = document.createElement("h3");
titulo.textContent = "Resultados del análisis Wi-Fi";

// Integral exacta
const exacto = document.createElement("p");
exacto.textContent =
    `Resultado exacto de la integral: ${resultado.exacto}`;

// Integral decimal
const decimal = document.createElement("p");
decimal.textContent =
    `Resultado decimal: ${resultado.decimal}`;

// Promedio espacial
const promedioElemento = document.createElement("p");

promedioElemento.className = "promedio-wifi";

promedioElemento.textContent =
    `Promedio espacial de señal: ${promedio.toFixed(2)} dBm`;

// Mostrar los resultados
contenedorResultado.append(
    titulo,
    exacto,
    decimal,
    promedioElemento
);

// COMPARACIÓN DEL TEOREMA DE FUBINI

if (resultado.fubini) {

    const fubini = resultado.fubini;

    const seccion = document.createElement("div");
    seccion.className = "resultado-fubini";

    const tituloFubini = document.createElement("h3");
    tituloFubini.textContent = "Verificación de Fubini";

    const orden1 = document.createElement("p");
    orden1.textContent =
        `Orden dy dx: ${fubini.dy_dx.exacto}`;

    const orden2 = document.createElement("p");
    orden2.textContent =
        `Orden dx dy: ${fubini.dx_dy.exacto}`;

    const conclusion = document.createElement("p");
    conclusion.className = "conclusion-fubini";

    conclusion.textContent = fubini.coinciden
        ? "Verificación correcta: ambos órdenes coinciden."
        : "Los resultados requieren revisión.";

    seccion.append(
        tituloFubini,
        orden1,
        orden2,
        conclusion
    );

    contenedorResultado.appendChild(seccion);
}

// ========================================
// TIEMPOS DE EJECUCIÓN DE FUBINI
// ========================================

if (resultado.tiempos) {

    const tiempos = resultado.tiempos;

    const seccionTiempos = document.createElement("div");
    seccionTiempos.className = "resultado-tiempos";

    const tituloTiempos = document.createElement("h3");
    tituloTiempos.textContent = "Tiempos de ejecución";

    const tiempo1 = document.createElement("p");
    tiempo1.textContent =
        `Primero y (dy dx): ${tiempos.dy_dx.toFixed(4)} ms`;

    const tiempo2 = document.createElement("p");
    tiempo2.textContent =
        `Primero x (dx dy): ${tiempos.dx_dy.toFixed(4)} ms`;

    seccionTiempos.append(
        tituloTiempos,
        tiempo1,
        tiempo2
    );

    contenedorResultado.appendChild(seccionTiempos);
}

// ========================================
// ACTUALIZAR TABLA COMPARATIVA
// ========================================

if (resultado.tiempos && routerX && routerY) {

    const x = Number(routerX.value);
    const y = Number(routerY.value);

    const xMin = Number(datos.get("x_min"));
    const xMax = Number(datos.get("x_max"));
    const yMin = Number(datos.get("y_min"));
    const yMax = Number(datos.get("y_max"));

    // Solo registrar el modelo de referencia
    // en el salón completo de 10 × 8 metros.
    const funcionEsperada =
        `-40-(x-${x})**2-(y-${y})**2`;

    const funcionActual = String(
        datos.get("funcion") || ""
    ).replace(/\s+/g, "");

    const esEscenarioReferencia =
        xMin === 0 &&
        xMax === 10 &&
        yMin === 0 &&
        yMax === 8 &&
        funcionActual === funcionEsperada;

    if (esEscenarioReferencia) {

        const filas = document.querySelectorAll(
            ".tabla-comparacion tbody tr"
        );

        filas.forEach(fila => {

            if (
                Number(fila.dataset.x) === x &&
                Number(fila.dataset.y) === y
            ) {

                const celdaDyDx = fila.querySelector(
                    ".tiempo-dy-dx"
                );

                const celdaDxDy = fila.querySelector(
                    ".tiempo-dx-dy"
                );

                if (celdaDyDx && celdaDxDy) {
                    celdaDyDx.textContent =
                        `${resultado.tiempos.dy_dx.toFixed(4)} ms`;

                    celdaDxDy.textContent =
                        `${resultado.tiempos.dx_dy.toFixed(4)} ms`;
                }
            }
        });
    }
}


// ========================================
// VALIDACIÓN NUMÉRICA CON SCIPY
// ========================================


// ========================================
// RESULTADOS DE SCIPY
// ========================================

if (resultado.validacion) {

    const validacion = resultado.validacion;

    const seccionValidacion = document.createElement("div");
    seccionValidacion.className = "resultado-validacion";

    const tituloValidacion = document.createElement("h3");
    tituloValidacion.textContent = "Validación numérica con SciPy";

    const resultadoSympy = document.createElement("p");
    resultadoSympy.textContent =
        `Resultado SymPy: ${Number(validacion.sympy).toFixed(6)}`;

    const resultadoScipy = document.createElement("p");
    resultadoScipy.textContent =
        `Resultado SciPy: ${Number(validacion.scipy).toFixed(6)}`;

    const errorAbsoluto = document.createElement("p");
    errorAbsoluto.textContent =
        `Error absoluto: ${Number(validacion.error_absoluto).toExponential(4)}`;

    seccionValidacion.append(
        tituloValidacion,
        resultadoSympy,
        resultadoScipy,
        errorAbsoluto
    );

    contenedorResultado.appendChild(seccionValidacion);
}


            if (resultado.grafica) {

                dibujarGrafica(resultado.grafica);

                document.dispatchEvent(
                    new CustomEvent("integralCalculada", {
                      detail: resultado.grafica
                    })
                );

            }

        } catch (error) {
            console.error(error);

            mostrarResultado(
                "Error",
                error.message
            );

        } finally {
            boton.disabled = false;
        }
    });

    
formulario.addEventListener("reset", () => {

    clearTimeout(temporizadorCalculo);

    document.dispatchEvent(
        new Event("integralLimpiada")
    );

    // Limpiar el resultado matemático
    mostrarResultado(
        "Resultado",
        "Introduce los datos y presiona Calcular integral."
    );

    // Limpiar la gráfica 2D
    const contenedor = document.getElementById(
        "grafica-2d"
    );

    if (contenedor && typeof Plotly !== "undefined") {
        Plotly.purge(contenedor);
    }

    // Esperar a que el navegador restaure el formulario
    // y actualizar la función y las coordenadas
    setTimeout(actualizarRouter, 0);

});


});
