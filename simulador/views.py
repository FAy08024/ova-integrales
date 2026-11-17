
import json
from time import perf_counter

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .services.calculadora import (
    calcular_integral_doble,
    generar_grafica_2d,
    validar_integral_scipy
)


def inicio(request):
    return render(request, "simulador/PANEL.html")


@require_POST
def calcular_integral(request):
    try:
        datos = json.loads(request.body)

        if not isinstance(datos, dict):
            raise ValueError("Los datos no son válidos.")

        # ======================================
        # COMPARACIÓN DE AMBOS ÓRDENES DE FUBINI
        # ======================================

        datos_dy_dx = datos.copy()
        datos_dy_dx["orden"] = "dy_dx"

        datos_dx_dy = datos.copy()
        datos_dx_dy["orden"] = "dx_dy"

        # Medir el orden dy dx
        inicio_dy_dx = perf_counter()

        resultado_dy_dx = calcular_integral_doble(
            datos_dy_dx
        )

        tiempo_dy_dx = (
            perf_counter() - inicio_dy_dx
        ) * 1000

        # Medir el orden dx dy
        inicio_dx_dy = perf_counter()

        resultado_dx_dy = calcular_integral_doble(
            datos_dx_dy
        )

        tiempo_dx_dy = (
            perf_counter() - inicio_dx_dy
        ) * 1000

        # ======================================
        # RESULTADO DEL ORDEN SELECCIONADO
        # ======================================

        orden = datos.get("orden")

        if orden == "dy_dx":
            resultado = resultado_dy_dx

        elif orden == "dx_dy":
            resultado = resultado_dx_dy

        else:
            raise ValueError(
                "El orden de integración no es válido."
            )

        # ======================================
        # VERIFICACIÓN DE FUBINI
        # ======================================

        coinciden = (
            resultado_dy_dx["exacto"]
            == resultado_dx_dy["exacto"]
        )

       
        # ======================================
        # GENERAR GRÁFICAS
        # ======================================

        grafica = generar_grafica_2d(datos)

        # ======================================
        # VALIDACIÓN NUMÉRICA CON SCIPY
        # ======================================

        validacion = validar_integral_scipy(
            datos,
            resultado["decimal"]
        )

        # ======================================
        # RESPUESTA A JAVASCRIPT
        # ======================================

        return JsonResponse({
            "ok": True,
            "exacto": resultado["exacto"],
            "decimal": resultado["decimal"],
            "grafica": grafica,
            "validacion": validacion,
            "fubini": {
                "dy_dx": resultado_dy_dx,
                "dx_dy": resultado_dx_dy,
                "coinciden": coinciden
            },
            "tiempos": {
                "dy_dx": round(tiempo_dy_dx, 4),
                "dx_dy": round(tiempo_dx_dy, 4),
                "unidad": "ms"
            }
        })


    except (
        ValueError,
        TypeError,
        UnicodeDecodeError
    ) as error:

        return JsonResponse({
            "ok": False,
            "error": str(error)
        }, status=400)
