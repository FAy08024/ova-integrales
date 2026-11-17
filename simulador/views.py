from django.shortcuts import render

def inicio(request):
    return render(request, 'simulador/PANEL.html')

import json

from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .services.calculadora import (
    calcular_integral_doble,
    generar_grafica_2d
)



@require_POST
def calcular_integral(request):
    try:
        datos = json.loads(request.body)

        if not isinstance(datos, dict):
            raise ValueError("Los datos no son válidos.")

        # Integral con el orden seleccionado
        resultado = calcular_integral_doble(datos)

        # Calcular automáticamente ambos órdenes
        datos_dy_dx = datos.copy()
        datos_dy_dx["orden"] = "dy_dx"

        datos_dx_dy = datos.copy()
        datos_dx_dy["orden"] = "dx_dy"

        resultado_dy_dx = calcular_integral_doble(datos_dy_dx)
        resultado_dx_dy = calcular_integral_doble(datos_dx_dy)

        # Comprobar igualdad para el modelo actual
        coinciden = (
            resultado_dy_dx["exacto"]
            == resultado_dx_dy["exacto"]
        )

        # Mantener los datos para las gráficas
        grafica = generar_grafica_2d(datos)

        return JsonResponse({
            "ok": True,
            "exacto": resultado["exacto"],
            "decimal": resultado["decimal"],
            "grafica": grafica,
            "fubini": {
                "dy_dx": resultado_dy_dx,
                "dx_dy": resultado_dx_dy,
                "coinciden": coinciden
            }
        })

    except (ValueError, TypeError, UnicodeDecodeError) as error:
        return JsonResponse({
            "ok": False,
            "error": str(error)
        }, status=400)
