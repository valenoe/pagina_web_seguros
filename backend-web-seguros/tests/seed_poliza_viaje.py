import json
import pymysql

# Póliza de prueba COMPLETA (todos los campos de web_polizas + web_poliza_pagos,
# más su cotización de origen, documentos y un beneficiario). Seguro de
# Asistencia en Viaje (Assist Card): un mes por Europa, pagado en 10 cuotas.
# Mismo cliente 2. Solo para ir revisando la visualización con datos ricos.
#
# Re-ejecutable (borra y recrea, sin duplicar). Desde backend-web-seguros:
#   ../entorno_web_seguros/Scripts/python.exe tests/seed_poliza_viaje.py
#
# Montos en UF (como los entrega el broker). Cuotas: 1 pagada, 9 pendientes.

CLIENTE_ID = 2
SEGURO_ID = 7  # Asistencia en Viaje (web_seguros_catalogo)
NUMERO_POLIZA = "VIAJE-2026-0847"
COT_MARCA = "SEED-VIAJE-EUROPA"  # marca para reconocer/limpiar la cotización

MATERIA_ASEGURADA = {
    "Destino": "Europa (Zona Schengen)",
    "Duración": "30 días",
    "Cobertura médica": "EUR 60.000",
    "Equipaje": "EUR 1.200",
    "Cancelación de viaje": "EUR 2.000",
    "COVID-19": "Incluida",
    "Pasajeros": "1",
    "Vigencia": "01-08-2026 al 31-08-2026",
}

# (numero_cuota, fecha_vencimiento, monto_uf, fecha_pago, estado, metodo, referencia)
CUOTAS = [
    (1,  "2026-08-05", 1.25, "2026-08-03", "pagada",    "Tarjeta de crédito", "TRX-2026-000847"),
    (2,  "2026-09-05", 1.25, None, "pendiente", None, None),
    (3,  "2026-10-05", 1.25, None, "pendiente", None, None),
    (4,  "2026-11-05", 1.25, None, "pendiente", None, None),
    (5,  "2026-12-05", 1.25, None, "pendiente", None, None),
    (6,  "2027-01-05", 1.25, None, "pendiente", None, None),
    (7,  "2027-02-05", 1.25, None, "pendiente", None, None),
    (8,  "2027-03-05", 1.25, None, "pendiente", None, None),
    (9,  "2027-04-05", 1.25, None, "pendiente", None, None),
    (10, "2027-05-05", 1.25, None, "pendiente", None, None),
]

c = pymysql.connect(host="localhost", port=3306,
                    user="seguros_user", password="user_1234",
                    database="seguros_web_db", charset="utf8mb4")
cur = c.cursor()

# Limpieza re-ejecutable (hijos primero; la cotización al final por el FK).
cur.execute("DELETE d FROM web_documentos_cliente d JOIN web_polizas p "
            "ON d.poliza_id=p.id_poliza WHERE p.numero_poliza=%s", (NUMERO_POLIZA,))
cur.execute("DELETE b FROM web_poliza_beneficiarios b JOIN web_polizas p "
            "ON b.poliza_id=p.id_poliza WHERE p.numero_poliza=%s", (NUMERO_POLIZA,))
cur.execute("DELETE FROM web_poliza_pagos WHERE poliza_id IN "
            "(SELECT id_poliza FROM web_polizas WHERE numero_poliza=%s)", (NUMERO_POLIZA,))
cur.execute("DELETE FROM web_polizas WHERE numero_poliza=%s", (NUMERO_POLIZA,))
cur.execute("DELETE FROM web_cotizaciones WHERE mensaje=%s", (COT_MARCA,))

# 1) Cotización de origen (llena cotizacion_id).
cur.execute(
    """INSERT INTO web_cotizaciones
       (seguro_id, cliente_id, nombre, rut, tipo_cliente, email, telefono, mensaje,
        datos_adicionales, canal, estado)
       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
    (SEGURO_ID, CLIENTE_ID, "Raylev", "20.185.875-5", "persona",
     "valenoe4@gmail.com", "+56935965746", COT_MARCA,
     json.dumps({"destino": "Europa", "dias": 30, "pasajeros": 1}, ensure_ascii=False),
     "digital", "convertida"),
)
cotizacion_id = cur.lastrowid

# 2) Póliza con TODOS los campos.
cur.execute(
    """INSERT INTO web_polizas
       (cliente_id, seguro_id, cotizacion_id, numero_poliza, compania, ramo, materia,
        producto, fecha_inicio, fecha_vencimiento, prima, prima_neta, prima_afecta,
        prima_exenta, iva, monto_asegurado, estado, origen, forma_pago, frecuencia_pago,
        num_cuotas, monto_cuota, fecha_proximo_pago, materia_asegurada)
       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
    (CLIENTE_ID, SEGURO_ID, cotizacion_id, NUMERO_POLIZA, "Assist Card",
     "Asistencia en viaje", "Viaje a Europa — 30 días",
     "Asistencia Internacional Europa Plus", "2026-08-01", "2026-08-31",
     12.50, 10.60, 10.00, 0.60, 1.90, 1800.00, "activa", "digital", "PAC", "mensual",
     len(CUOTAS), 1.25, "2026-09-05",
     json.dumps(MATERIA_ASEGURADA, ensure_ascii=False)),
)
poliza_id = cur.lastrowid

# 3) Cuotas.
cur.executemany(
    """INSERT INTO web_poliza_pagos
       (poliza_id, numero_cuota, monto, fecha_vencimiento, fecha_pago, estado,
        metodo_pago, referencia_transaccion)
       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
    [(poliza_id, n, m, fv, fp, est, met, ref) for (n, fv, m, fp, est, met, ref) in CUOTAS],
)

# 4) Documentos.
cur.executemany(
    """INSERT INTO web_documentos_cliente
       (cliente_id, poliza_id, nombre, tipo, estado, url) VALUES (%s,%s,%s,%s,%s,%s)""",
    [(CLIENTE_ID, poliza_id, "Póliza Asistencia en Viaje", "Póliza", "Disponible", None),
     (CLIENTE_ID, poliza_id, "Tarjeta de Asistencia", "Certificado", "Disponible", None)],
)

# 5) Beneficiario / contacto.
cur.execute(
    """INSERT INTO web_poliza_beneficiarios (poliza_id, nombre, rut, relacion)
       VALUES (%s,%s,%s,%s)""",
    (poliza_id, "Ana Rivas (contacto de emergencia)", "15.222.333-4", "Cónyuge"),
)

c.commit()
print(f"Póliza VIAJE insertada, id: {poliza_id} | prima 12.50 UF | {len(CUOTAS)} cuotas "
      f"| cotización {cotizacion_id} | 2 docs | 1 beneficiario")
