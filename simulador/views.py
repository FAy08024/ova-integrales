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
            raise ValueError("Los datos enviados no son válidos.")

        resultado = calcular_integral_doble(datos)
        grafica = generar_grafica_2d(datos)

        return JsonResponse({
    "ok": True,
    "exacto": resultado["exacto"],
    "decimal": resultado["decimal"],
    "grafica": grafica
})

    except (ValueError, TypeError, UnicodeDecodeError) as error:
        return JsonResponse({
            "ok": False,
            "error": str(error)
        }, status=400)
