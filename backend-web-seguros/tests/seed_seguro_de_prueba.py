import pymysql
from datetime import date, timedelta

# Póliza de prueba para el cliente 2 (Valery): auto Zurich por vencer mañana.
# Sirve para probar la notificación "Póliza por vencer" + la pestaña Pólizas.
# Se corre desde backend-web-seguros:
#   ../entorno_web_seguros/Scripts/python.exe tests/seed_seguro_de_prueba.py

NUMERO_POLIZA = "AUTO-ZUR-2026-001"

c = pymysql.connect(host='localhost', port=3306,
                    user='seguros_user', password='user_1234',
                    database='seguros_web_db')
cur = c.cursor()

hoy = date.today()

# Re-ejecutable: borra la póliza de prueba anterior (y sus pagos) antes de crearla,
# así no se duplica cada vez que se corre el script.
cur.execute(
    "DELETE FROM web_poliza_pagos WHERE poliza_id IN "
    "(SELECT id_poliza FROM web_polizas WHERE numero_poliza=%s)",
    (NUMERO_POLIZA,),
)
cur.execute("DELETE FROM web_polizas WHERE numero_poliza=%s", (NUMERO_POLIZA,))

cur.execute('''INSERT INTO web_polizas
  (cliente_id, seguro_id, numero_poliza, compania, fecha_inicio, fecha_vencimiento, prima, estado, origen)
  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
  (2, 1, NUMERO_POLIZA, 'Zurich',
   hoy - timedelta(days=364),   # inicio (hace ~1 año)
   hoy + timedelta(days=1),     # vence mañana → dispara la alerta (<=30 días)
   10,                         # prima EN UF (el front la muestra como "5.5 UF")
   'activa', 'manual'))
poliza_id = cur.lastrowid

# (Opcional) descomenta para probar también la notificación "Cuota próxima":
# el monto de la cuota va en PESOS (el front lo muestra con "$").
# cur.execute('''INSERT INTO web_poliza_pagos
#   (poliza_id, numero_cuota, monto, fecha_vencimiento, estado)
#   VALUES (%s,%s,%s,%s,%s)''',
#   (poliza_id, 3, 128000, hoy + timedelta(days=10), 'pendiente'))

c.commit()
print(f'Póliza insertada, id: {poliza_id} | prima {10} | vence {hoy + timedelta(days=1)}')
