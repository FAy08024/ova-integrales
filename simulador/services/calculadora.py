
import ast
import math
import sympy as sp

x, y = sp.symbols("x y")

VARIABLES = {"x": x, "y": y}


def interpretar_funcion(texto):
    """
    Convierte una expresión polinómica sencilla
    en una expresión de SymPy sin ejecutar
    código Python escrito por el usuario.
    """

    if not isinstance(texto, str) or len(texto) > 100:
        raise ValueError("La función es demasiado larga.")

    try:
        arbol = ast.parse(texto, mode="eval")
    except SyntaxError:
        raise ValueError("La función tiene una sintaxis incorrecta.")

    if sum(1 for _ in ast.walk(arbol)) > 60:
        raise ValueError("La expresión es demasiado compleja.")

    def convertir(nodo):

        if isinstance(nodo, ast.Expression):
            return convertir(nodo.body)

        if isinstance(nodo, ast.Name):
            if nodo.id in VARIABLES:
                return VARIABLES[nodo.id]
            raise ValueError("Solo se permiten x e y.")

        if isinstance(nodo, ast.Constant):
            valor = nodo.value

            if isinstance(valor, bool) or not isinstance(
                valor, (int, float)
            ):
                raise ValueError("Número no válido.")

            if not math.isfinite(valor) or abs(valor) > 1000:
                raise ValueError("Número fuera del rango permitido.")

            return sp.Rational(str(valor))

        if isinstance(nodo, ast.UnaryOp):
            valor = convertir(nodo.operand)

            if isinstance(nodo.op, ast.USub):
                return -valor

            if isinstance(nodo.op, ast.UAdd):
                return valor

        if isinstance(nodo, ast.BinOp):
            izquierdo = convertir(nodo.left)
            derecho = convertir(nodo.right)

            if isinstance(nodo.op, ast.Add):
                return izquierdo + derecho

            if isinstance(nodo.op, ast.Sub):
                return izquierdo - derecho

            if isinstance(nodo.op, ast.Mult):
                return izquierdo * derecho

            if isinstance(nodo.op, ast.Div):
                if not derecho.is_number or derecho == 0:
                    raise ValueError(
                        "Solo se permite dividir por constantes no nulas."
                    )
                return izquierdo / derecho

            if isinstance(nodo.op, ast.Pow):
                if not derecho.is_Integer:
                    raise ValueError(
                        "Usa exponentes enteros de 0 a 6."
                    )

                exponente = int(derecho)

                if not 0 <= exponente <= 6:
                    raise ValueError(
                        "Usa exponentes enteros de 0 a 6."
                    )

                return izquierdo ** exponente

        raise ValueError(
            "Expresión no permitida. Usa x, y, +, -, *, / y **."
        )

    expresion = convertir(arbol)

    try:
        polinomio = sp.Poly(expresion, x, y)
    except sp.PolynomialError:
        raise ValueError("Solo se admiten polinomios.")

    if polinomio.total_degree() > 8:
        raise ValueError("El grado máximo permitido es 8.")

    return expresion


def calcular_integral_doble(datos):

    if datos.get("tipo") != "doble":
        raise ValueError("Solo están disponibles integrales dobles.")

    if datos.get("coordenadas") != "cartesianas":
        raise ValueError("Solo están disponibles coordenadas cartesianas.")

    funcion = interpretar_funcion(datos.get("funcion", ""))

    def limite(nombre):
        try:
            valor = float(datos[nombre])
        except (KeyError, ValueError, TypeError, OverflowError):
            raise ValueError(f"El límite {nombre} no es válido.")

        if not math.isfinite(valor) or abs(valor) > 100:
            raise ValueError(
                f"El límite {nombre} debe estar entre -100 y 100."
            )

        return sp.Rational(str(valor))

    x_min = limite("x_min")
    x_max = limite("x_max")
    y_min = limite("y_min")
    y_max = limite("y_max")

    if x_min >= x_max or y_min >= y_max:
        raise ValueError(
            "El límite superior debe ser mayor que el inferior."
        )

    orden = datos.get("orden")

    if orden == "dy_dx":
        resultado = sp.integrate(
            funcion,
            (y, y_min, y_max),
            (x, x_min, x_max)
        )

    elif orden == "dx_dy":
        resultado = sp.integrate(
            funcion,
            (x, x_min, x_max),
            (y, y_min, y_max)
        )

    else:
        raise ValueError("Orden de integración no válido.")

    if not resultado.is_finite:
        raise ValueError("No se obtuvo un resultado finito.")

    return {
        "exacto": str(resultado),
        "decimal": str(sp.N(resultado, 10))
    }

import numpy as np


def generar_grafica_2d(datos):
    # Reutilizamos el intérprete matemático existente
    funcion = interpretar_funcion(datos["funcion"])

    x_min = float(datos["x_min"])
    x_max = float(datos["x_max"])
    y_min = float(datos["y_min"])
    y_max = float(datos["y_max"])

    # 40 puntos por eje: 1600 valores
    valores_x = np.linspace(x_min, x_max, 40)
    valores_y = np.linspace(y_min, y_max, 40)

    X, Y = np.meshgrid(valores_x, valores_y)

    # Convertir la expresión de SymPy
    # en una función numérica
    funcion_numerica = sp.lambdify(
        (x, y), funcion, modules="numpy"
    )

    Z = funcion_numerica(X, Y)

    # Maneja también funciones constantes
    Z = np.broadcast_to(
        np.asarray(Z, dtype=float), X.shape
    )

    if not np.all(np.isfinite(Z)):
        raise ValueError(
            "La función produce valores no válidos."
        )

    return {
        "x": valores_x.tolist(),
        "y": valores_y.tolist(),
        "z": Z.tolist()
    }
