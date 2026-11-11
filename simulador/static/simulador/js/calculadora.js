
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


function actualizarRouter() {

    if (!routerX || !routerY || !campoFuncion) {
        return;
    }

    // Obtener posición actual
    const a = Number(routerX.value);
    const b = Number(routerY.value);

    // Actualizar los metros mostrados
    valorRouterX.textContent = `${a} m`;
    valorRouterY.textContent = `${b} m`;

    // Actualizar las coordenadas
    coordenadasRouter.textContent = `(${a}, ${b})`;

    // Actualizar automáticamente la función
    campoFuncion.value =
        `-40-(x-${a})**2-(y-${b})**2`;
}


// Detectar movimiento de los controles
if (routerX && routerY) {

    routerX.addEventListener("input", actualizarRouter);
    routerY.addEventListener("input", actualizarRouter);

    // Inicializar función y coordenadas
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

        const contenedor = document.getElementById(
            "grafica-2d"
        );

        if (!contenedor || typeof Plotly === "undefined") {
            console.warn("Plotly no está disponible.");
            return;
        }

        Plotly.react(contenedor, [{
            x: grafica.x,
            y: grafica.y,
            z: grafica.z,
            type: "contour",
            colorscale: "Viridis",
            contours: {
                coloring: "heatmap",
                showlines: true
            }
        }], {
            title: {
                text: "Mapa de contornos"
            },
            xaxis: {
                title: { text: "X" }
            },
            yaxis: {
                title: { text: "Y" },
                scaleanchor: "x"
            },
            margin: {
                l: 55,
                r: 35,
                t: 60,
                b: 55
            }
        }, {
            responsive: true,
            displaylogo: false
        });
    }

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const boton = formulario.querySelector(
            'button[type="submit"]'
        );

        const datos = new FormData(formulario);

        const integral = {
            tipo: datos.get("tipo"),
            coordenadas: datos.get("coordenadas"),
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

            mostrarResultado(
                "Resultado de la integral",
                `Exacto: ${resultado.exacto} | Decimal: ${resultado.decimal}`
            );

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

    // Avisar al visualizador 3D que debe limpiarse
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
