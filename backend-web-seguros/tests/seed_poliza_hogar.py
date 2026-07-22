import json
import pymysql

# Póliza de prueba REALISTA: Seguro de Hogar (Zurich) para el cliente 2, con sus
# 10 cuotas en web_poliza_pagos. Sirve para probar el detalle de póliza + la
# pestaña "Pagos y cuotas" con datos decentes.
#
# Es re-ejecutable: borra la póliza y sus cuotas antes de recrearlas (no duplica).
# Se corre desde backend-web-seguros con el venv activo:
#   ../entorno_web_seguros/Scripts/python.exe tests/seed_poliza_hogar.py
#
# OJO: los montos (prima y cuotas) están en UF, igual que los entrega el broker.

CLIENTE_ID = 2
SEGURO_ID = 4  # Seguro de Hogar (web_seguros_catalogo)
NUMERO_POLIZA = "595393"

# Detalles variables del ramo hogar → se guardan como JSON en materia_asegurada.
MATERIA_ASEGURADA = {
    "Tipo de construcción": "SÓLIDO",
    "Tipo de vivienda": "CASA HABITACIÓN",
    "Ocupación": "HABITUAL",
    "Dirección": "LOTE LOMO VERDE, SITIO 37, TALCA",
    "Monto edificio (UF)": "7.200",
    "Monto contenido (UF)": "2.500",
}

# Cuotas: (numero_cuota, fecha_vencimiento, monto_uf). Todas pendientes.
CUOTAS = [
    (1, "2026-08-25", 2.01),
    (2, "2026-09-25", 2.01),
    (3, "2026-10-25", 2.01),
    (4, "2026-11-25", 2.01),
    (5, "2026-12-25", 2.01),
    (6, "2027-01-25", 2.01),
    (7, "2027-02-25", 2.01),
    (8, "2027-03-25", 2.01),
    (9, "2027-04-25", 2.01),
    (10, "2027-05-25", 1.98),
]

c = pymysql.connect(host="localhost", port=3306,
                    user="seguros_user", password="user_1234",
                    database="seguros_web_db", charset="utf8mb4")
cur = c.cursor()

# Re-ejecutable: limpiar la póliza de prueba anterior (y sus cuotas).
cur.execute(
    "DELETE FROM web_poliza_pagos WHERE poliza_id IN "
    "(SELECT id_poliza FROM web_polizas WHERE numero_poliza=%s)",
    (NUMERO_POLIZA,),
)
cur.execute("DELETE FROM web_polizas WHERE numero_poliza=%s", (NUMERO_POLIZA,))

cur.execute(
    """INSERT INTO web_polizas
       (cliente_id, seguro_id, numero_poliza, compania, ramo, materia, producto,
        fecha_inicio, fecha_vencimiento, prima, monto_asegurado, estado, origen,
        forma_pago, frecuencia_pago, num_cuotas, monto_cuota, fecha_proximo_pago,
        materia_asegurada)
       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
    (
        CLIENTE_ID, SEGURO_ID, NUMERO_POLIZA, "ZURICH", "hogar",
        "Casa habitación, ocupación habitual", "INCENDIO + SISMO",
        "2026-07-27", "2027-07-27",
        20.07,   # prima total (bruta) en UF
        9700,    # monto asegurado (edificio 7.200 + contenido 2.500) en UF
        "activa", "manual",
        "AVISO CUOTA", "mensual",
        len(CUOTAS), 2.01, CUOTAS[0][1],
        json.dumps(MATERIA_ASEGURADA, ensure_ascii=False),
    ),
)
poliza_id = cur.lastrowid

cur.executemany(
    """INSERT INTO web_poliza_pagos
       (poliza_id, numero_cuota, monto, fecha_vencimiento, estado)
       VALUES (%s,%s,%s,%s,%s)""",
    [(poliza_id, num, monto, fecha, "pendiente") for num, fecha, monto in CUOTAS],
)

c.commit()
print(f"Póliza HOGAR insertada, id: {poliza_id} | prima 20.07 UF | {len(CUOTAS)} cuotas")
