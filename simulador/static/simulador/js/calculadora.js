
document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById(
        "form-calculadora"
    );

    const contenedorResultado = document.getElementById(
        "resultado-integral"
    );

    if (!formulario || !contenedorResultado) {
        return;
    }

    // Crear mensajes de forma segura, sin insertar HTML
    function mostrarResultado(titulo, mensaje) {
        contenedorResultado.replaceChildren();

        const h3 = document.createElement("h3");
        h3.textContent = titulo;

        const p = document.createElement("p");
        p.textContent = mensaje;

        contenedorResultado.append(h3, p);
    }

    formulario.addEventListener("submit", async (evento) => {

        // Evita recargar toda la página
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

        const csrf = datos.get("csrfmiddlewaretoken");

        boton.disabled = true;
        mostrarResultado("Calculando...", "Procesando integral.");

        try {
            const respuesta = await fetch(formulario.dataset.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrf
                },
                body: JSON.stringify(integral)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.error || "No fue posible calcular."
                );
            }

            mostrarResultado(
                "Resultado de la integral",
                `Exacto: ${resultado.exacto} | ` +
                `Decimal: ${resultado.decimal}`
            );

        } catch (error) {
            mostrarResultado("Error", error.message);

        } finally {
            boton.disabled = false;
        }
    });

    formulario.addEventListener("reset", () => {
           mostrarResultado(
        "Resultado de la integral",
        `Exacto: ${resultado.exacto} | ` +
         `Decimal: ${resultado.decimal}`
);
    });

});

if (resultado.grafica && typeof Plotly !== "undefined") {

    const grafica = resultado.grafica;

    Plotly.react("grafica-2d", [{
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
            title: {
                text: "f(x,y)"
            }
        }
    }], {
        title: {
            text: "Gráfica 2D de la función"
        },
        xaxis: {
            title: { text: "X" }
        },
        yaxis: {
            title: { text: "Y" },
            scaleanchor: "x",
            scaleratio: 1
        },
        margin: {
            l: 55,
            r: 30,
            t: 55,
            b: 50
        }
    }, {
        responsive: true,
        displaylogo: false
    });

}
