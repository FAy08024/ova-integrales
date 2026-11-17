
import json

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .services.calculadora import (
    calcular_integral_doble,
    generar_grafica_2d
)


# ==========================================
# VISTA DEL SIMULADOR
# ==========================================

def inicio(request):
    return render(request, 'simulador/PANEL.html')


# ==========================================
# CALCULADORA DE INTEGRALES
# ==========================================

@require_POST
def calcular_integral(request):

    try:
        # Recibir los datos enviados por JavaScript
        datos = json.loads(request.body)

        # DEPURACIÓN: comprobar qué recibe Django
        print("\n========== DATOS RECIBIDOS ==========", flush=True)
        print("Datos:", datos, flush=True)

        if not isinstance(datos, dict):
            raise ValueError("Los datos no son válidos.")

        print("Tipo de integral:", datos.get("tipo"), flush=True)
        print("Coordenadas:", datos.get("coordenadas"), flush=True)
        print("Función:", datos.get("funcion"), flush=True)
        print("Orden:", datos.get("orden"), flush=True)

        # ==================================
        # INTEGRAL CON EL ORDEN SELECCIONADO
        # ==================================

        resultado = calcular_integral_doble(datos)

        # ==================================
        # VERIFICACIÓN DEL TEOREMA DE FUBINI
        # ==================================

        datos_dy_dx = datos.copy()
        datos_dy_dx["orden"] = "dy_dx"

        datos_dx_dy = datos.copy()
        datos_dx_dy["orden"] = "dx_dy"

        resultado_dy_dx = calcular_integral_doble(
            datos_dy_dx
        )

        resultado_dx_dy = calcular_integral_doble(
            datos_dx_dy
        )

        # Comparar los resultados exactos
        coinciden = (
            resultado_dy_dx["exacto"]
            == resultado_dx_dy["exacto"]
        )

        # ==================================
        # GENERAR DATOS PARA GRÁFICAS 2D/3D
        # ==================================

        grafica = generar_grafica_2d(datos)

        # ==================================
        # DEVOLVER RESULTADOS A JAVASCRIPT
        # ==================================

        print("Resultado:", resultado, flush=True)
        print("Fubini coincide:", coinciden, flush=True)
        print("=====================================\n", flush=True)

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

        print("\n========== ERROR ==========", flush=True)
        print("Error:", str(error), flush=True)
        print("===========================\n", flush=True)

        return JsonResponse({
            "ok": False,
            "error": str(error)
        }, status=400)
