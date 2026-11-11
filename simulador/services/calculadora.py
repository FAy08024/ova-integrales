
import ast
import math
import sympy as sp

x, y = sp.symbols("x y")

VARIABLES = {"x": x, "y": y}



def interpretar_funcion(texto):

    import ast
    import sympy as sp

    x, y = sp.symbols("x y")

    variables = {
        "x": x,
        "y": y,
        "pi": sp.pi
    }

    funciones = {
        "sqrt": sp.sqrt,
        "sin": sp.sin,
        "cos": sp.cos
    }

    if not isinstance(texto, str) or len(texto) > 100:
        raise ValueError("La función es demasiado larga.")

    try:
        arbol = ast.parse(texto, mode="eval")
    except SyntaxError:
        raise ValueError("Sintaxis matemática incorrecta.")

    if sum(1 for _ in ast.walk(arbol)) > 50:
        raise ValueError("La expresión es demasiado compleja.")

    def convertir(nodo):

        if isinstance(nodo, ast.Expression):
            return convertir(nodo.body)

        if isinstance(nodo, ast.Name):
            if nodo.id in variables:
                return variables[nodo.id]
            raise ValueError("Variable desconocida.")

        if isinstance(nodo, ast.Constant):
            valor = nodo.value

            if isinstance(valor, bool) or not isinstance(
                valor, (int, float)
            ):
                raise ValueError("Número no permitido.")

            numero = sp.Rational(str(valor))

            if abs(numero) > 1000:
                raise ValueError("Número demasiado grande.")

            return numero

        if isinstance(nodo, ast.UnaryOp):
            valor = convertir(nodo.operand)

            if isinstance(nodo.op, ast.USub):
                return -valor

            if isinstance(nodo.op, ast.UAdd):
                return valor

        if isinstance(nodo, ast.BinOp):

            a = convertir(nodo.left)
            b = convertir(nodo.right)

            if isinstance(nodo.op, ast.Add):
                return a + b

            if isinstance(nodo.op, ast.Sub):
                return a - b

            if isinstance(nodo.op, ast.Mult):
                return a * b

            if isinstance(nodo.op, ast.Div):
                if not b.is_number or b == 0:
                    raise ValueError(
                        "Por ahora solo se permite dividir "
                        "entre constantes distintas de cero."
                    )
                return a / b

            if isinstance(nodo.op, ast.Pow):
                if not b.is_Rational:
                    raise ValueError(
                        "El exponente debe ser un número racional."
                    )

                if abs(b) > 6 or b.q > 4:
                    raise ValueError(
                        "El exponente excede los límites permitidos."
                    )

                return a ** b

        if isinstance(nodo, ast.Call):

            if (
                not isinstance(nodo.func, ast.Name)
                or nodo.func.id not in funciones
                or len(nodo.args) != 1
                or nodo.keywords
            ):
                raise ValueError("Función matemática no permitida.")

            argumento = convertir(nodo.args[0])

            return funciones[nodo.func.id](argumento)

        raise ValueError("Expresión matemática no permitida.")

    return convertir(arbol)


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
