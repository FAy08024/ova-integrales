
document.addEventListener("DOMContentLoaded", () => {

    // Copiar funciones o integrales
    document.querySelectorAll(".copiar-funcion").forEach(boton => {

        boton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(
                    boton.dataset.texto
                );

                document.getElementById(
                    "mensaje-comparacion"
                ).textContent = "Expresión copiada correctamente.";

            } catch (error) {
                console.error(error);
            }
        });
    });

    // Cargar los escenarios en la calculadora
    document.querySelectorAll(".cargar-ejemplo").forEach(boton => {

        boton.addEventListener("click", () => {

            const routerX = document.getElementById("router-x");
            const routerY = document.getElementById("router-y");

            if (!routerX || !routerY) {
                return;
            }

            routerX.value = boton.dataset.x;
            routerY.value = boton.dataset.y;

            // Activar actualización de metros y función
            routerX.dispatchEvent(new Event("input"));
            routerY.dispatchEvent(new Event("input"));

            // Restaurar dimensiones del salón
            document.getElementById("x-min").value = 0;
            document.getElementById("x-max").value = 10;
            document.getElementById("y-min").value = 0;
            document.getElementById("y-max").value = 8;

            // Llevar al usuario hasta el formulario
            document.getElementById(
                "form-calculadora"
            ).scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    });

});
