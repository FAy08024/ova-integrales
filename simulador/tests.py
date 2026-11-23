
import json

from django.test import SimpleTestCase
from django.urls import reverse

from .services.calculadora import (
    calcular_integral_doble,
    generar_grafica_2d,
    validar_integral_scipy,
)


class PruebasSimulador(SimpleTestCase):

    # Datos de entrada comunes para las pruebas
    def crear_datos(self, funcion, orden="dy_dx"):
        return {
            "tipo": "doble",
            "coordenadas": "cartesianas",
            "funcion": funcion,
            "orden": orden,
            "x_min": 0,
            "x_max": 10,
            "y_min": 0,
            "y_max": 8,
        }

    # PRUEBA 1: Router en el centro
    def test_01_router_centro(self):
        datos = self.crear_datos(
            "-40-(x-5)**2-(y-4)**2"
        )

        resultado = calcular_integral_doble(datos)

        self.assertEqual(
            resultado["exacto"],
            "-12880/3"
        )

    # PRUEBA 2: Router en la esquina
    def test_02_router_esquina(self):
        datos = self.crear_datos(
            "-40-x**2-y**2"
        )

        resultado = calcular_integral_doble(datos)

        self.assertEqual(
            resultado["exacto"],
            "-22720/3"
        )

    # PRUEBA 3: Router lateral
    def test_03_router_lateral(self):
        datos = self.crear_datos(
            "-40-(x-2)**2-(y-4)**2"
        )

        resultado = calcular_integral_doble(datos)

        self.assertEqual(
            resultado["exacto"],
            "-15040/3"
        )

    # PRUEBA 4: Teorema de Fubini
    def test_04_ordenes_fubini(self):
        funcion = "-40-(x-5)**2-(y-4)**2"

        datos_a = self.crear_datos(
            funcion, "dy_dx"
        )

        datos_b = self.crear_datos(
            funcion, "dx_dy"
        )

        resultado_a = calcular_integral_doble(datos_a)
        resultado_b = calcular_integral_doble(datos_b)

        self.assertEqual(
            resultado_a["exacto"],
            resultado_b["exacto"]
        )

        self.assertEqual(
            resultado_a["exacto"],
            "-12880/3"
        )

    # PRUEBA 5: Validación con SciPy
    def test_05_validacion_scipy(self):
        datos = self.crear_datos(
            "-40-(x-5)**2-(y-4)**2"
        )

        esperado = -12880 / 3

        validacion = validar_integral_scipy(
            datos,
            esperado
        )

        self.assertAlmostEqual(
            validacion["scipy"],
            esperado,
            places=5
        )

        self.assertAlmostEqual(
            validacion["error_absoluto"],
            0,
            places=5
        )

    # PRUEBA 6: Límites incorrectos
    def test_06_limites_invertidos(self):
        datos = self.crear_datos(
            "-40-(x-5)**2-(y-4)**2"
        )

        datos["x_min"] = 10
        datos["x_max"] = 0

        with self.assertRaises(ValueError):
            calcular_integral_doble(datos)

    # PRUEBA 7: Función no permitida
    def test_07_funcion_invalida(self):
        datos = self.crear_datos(
            "funcion_desconocida(x)"
        )

        with self.assertRaises(ValueError):
            calcular_integral_doble(datos)

    # PRUEBA 8: Respuesta completa de Django
    def test_08_respuesta_simulador(self):
        datos = self.crear_datos(
            "-40-(x-5)**2-(y-4)**2"
        )

        respuesta = self.client.post(
            reverse("calcular_integral"),
            data=json.dumps(datos),
            content_type="application/json"
        )

        self.assertEqual(
            respuesta.status_code,
            200
        )

        contenido = respuesta.json()

        self.assertTrue(contenido["ok"])

        self.assertEqual(
            contenido["exacto"],
            "-12880/3"
        )

        self.assertTrue(
            contenido["fubini"]["coinciden"]
        )

        self.assertIn("grafica", contenido)
        self.assertIn("validacion", contenido)
        self.assertIn("tiempos", contenido)

        # Comprobar las dimensiones de la gráfica
        grafica = contenido["grafica"]

        self.assertEqual(len(grafica["x"]), 40)
        self.assertEqual(len(grafica["y"]), 40)
        self.assertEqual(len(grafica["z"]), 40)
        self.assertEqual(len(grafica["z"][0]), 40)
