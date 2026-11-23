
document.addEventListener("DOMContentLoaded", () => {

    const boton2D = document.getElementById("boton-2d");
    const boton3D = document.getElementById("boton-3d");

    const grafica2D = document.getElementById("grafica-2d");
    const grafica3D = document.getElementById("grafica-3d");

    const mensaje = document.getElementById("mensaje-grafica");

    let datosActuales = null;
    let vistaActual = "2d";

    if (!boton2D || !boton3D || !grafica2D || !grafica3D) {
        return;
    }

    
function dibujar3D(datos) {

    if (typeof Plotly === "undefined") {
        console.warn("Plotly no está disponible.");
        return;
    }

    // ========================================
    // OBTENER LA UBICACIÓN DEL ROUTER
    // ========================================

    const xRouter = Number(
        document.getElementById("router-x").value
    );

    const yRouter = Number(
        document.getElementById("router-y").value
    );

    // ========================================
    // CALCULAR LA ALTURA DEL MARCADOR
    // SEGÚN LOS DATOS DE LA GRÁFICA
    // ========================================

    // Buscar los puntos más cercanos en cada eje
    function intervalo(valores, objetivo) {
        let superior = valores.findIndex(
            valor => valor >= objetivo
        );

        if (superior === -1) {
            superior = valores.length - 1;
        }

        const inferior = Math.max(0, superior - 1);

        return [inferior, superior];
    }

    const [ix0, ix1] = intervalo(datos.x, xRouter);
    const [iy0, iy1] = intervalo(datos.y, yRouter);

    const x0 = datos.x[ix0];
    const x1 = datos.x[ix1];
    const y0 = datos.y[iy0];
    const y1 = datos.y[iy1];

    const tx = x1 === x0
        ? 0
        : (xRouter - x0) / (x1 - x0);

    const ty = y1 === y0
        ? 0
        : (yRouter - y0) / (y1 - y0);

    // Interpolación bilineal sobre la superficie
    const z00 = datos.z[iy0][ix0];
    const z10 = datos.z[iy0][ix1];
    const z01 = datos.z[iy1][ix0];
    const z11 = datos.z[iy1][ix1];

    const zRouter =
        (1 - tx) * (1 - ty) * z00 +
        tx * (1 - ty) * z10 +
        (1 - tx) * ty * z01 +
        tx * ty * z11;

    // Solo mostrar el router si está dentro
    // de los límites de integración
    const dentroDeRegion =
        xRouter >= datos.x[0] &&
        xRouter <= datos.x[datos.x.length - 1] &&
        yRouter >= datos.y[0] &&
        yRouter <= datos.y[datos.y.length - 1];

    // ========================================
    // SUPERFICIE WI-FI
    // ========================================

    const superficie = {
        type: "surface",

        x: datos.x,
        y: datos.y,
        z: datos.z,

        colorscale: "Viridis",

        contours: {
            z: {
                show: true,
                usecolormap: true,
                project: {
                    z: true
                }
            }
        },

        colorbar: {
            title: {
                text: "Señal (dBm)"
            }
        },

        name: "Señal Wi-Fi",

        hovertemplate:
            "X: %{x:.2f} m<br>" +
            "Y: %{y:.2f} m<br>" +
            "Señal: %{z:.2f} dBm" +
            "<extra></extra>"
    };

    // ========================================
    // MARCADOR DEL ROUTER
    // ========================================

    const marcadorRouter = {
        type: "scatter3d",

        mode: "markers+text",

        x: [xRouter],
        y: [yRouter],
        z: [zRouter],

        text: [`Router (${xRouter}, ${yRouter})`],

        textposition: "top center",

        textfont: {
            color: "#dc3545",
            size: 12
        },

        marker: {
            color: "#dc3545",
            size: 7,
            symbol: "circle",
            line: {
                color: "#ffffff",
                width: 2
            }
        },

        name: "Router",

        hovertemplate:
            "<b>Router Wi-Fi</b><br>" +
            "X: %{x} m<br>" +
            "Y: %{y} m<br>" +
            "Señal aproximada: %{z:.2f} dBm" +
            "<extra></extra>"
    };

    const graficas = [superficie];

    if (dentroDeRegion && Number.isFinite(zRouter)) {
        graficas.push(marcadorRouter);
    }

    // ========================================
    // DIBUJAR GRÁFICA 3D
    // ========================================

    return Plotly.react(
        grafica3D,
        graficas,
        {
            title: {
                text: "Distribución de señal Wi-Fi en 3D"
            },

            scene: {
                xaxis: {
                    title: { text: "X (m)" }
                },

                yaxis: {
                    title: { text: "Y (m)" }
                },

                zaxis: {
                    title: { text: "Señal (dBm)" }
                },

                aspectmode: "auto"
            },

            margin: {
                l: 0,
                r: 0,
                t: 50,
                b: 0
            },

            showlegend: false
        },
        {
            responsive: true,
            displaylogo: false
        }
    );
}


    function cambiarVista(vista) {

        vistaActual = vista;

        grafica2D.hidden = vista !== "2d";
        grafica3D.hidden = vista !== "3d";

        boton2D.classList.toggle("activo", vista === "2d");
        boton3D.classList.toggle("activo", vista === "3d");

        if (!datosActuales || typeof Plotly === "undefined") {
            return;
        }

        if (vista === "3d") {
            dibujar3D(datosActuales);
        } else {
            Plotly.Plots.resize(grafica2D);
        }
    }

    boton2D.addEventListener("click", () => {
        cambiarVista("2d");
    });

    boton3D.addEventListener("click", () => {
        cambiarVista("3d");
    });

    // Recibir los datos calculados desde calculadora.js
    document.addEventListener("integralCalculada", (evento) => {

        datosActuales = evento.detail;

        if (mensaje) {
            mensaje.hidden = true;
        }

        cambiarVista(vistaActual);
    });

    document.addEventListener("integralLimpiada", () => {

        datosActuales = null;

        if (typeof Plotly !== "undefined") {
            Plotly.purge(grafica3D);
        }

        if (mensaje) {
            mensaje.hidden = false;
        }
    });

});
