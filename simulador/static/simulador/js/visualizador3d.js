
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

        return Plotly.react(grafica3D, [{
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
                    text: "f(x,y)"
                }
            }

        }], {

            title: {
                text: "Superficie z = f(x,y)"
            },

            scene: {
                xaxis: {
                    title: {text: "X"}
                },

                yaxis: {
                    title: {text: "Y"}
                },

                zaxis: {
                    title: {text: "Z"}
                },

                aspectmode: "auto"
            },

            margin: {
                l: 0,
                r: 0,
                t: 50,
                b: 0
            }

        }, {
            responsive: true,
            displaylogo: false
        });
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
