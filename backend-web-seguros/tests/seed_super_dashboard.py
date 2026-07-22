"""
Super seed para poblar el DASHBOARD PRINCIPAL del cliente 2 con 5 pólizas de los
ramos que controlamos (auto, hogar, mujer_segura, garantías, accidentes).

Montos en UF. Cuotas: pagadas las de fecha pasada, pendientes las futuras
(referencia: TODAY). Una póliza queda "por vencer" para disparar la alerta.

NO necesita pymysql: genera SQL por stdout. Uso (desde backend-web-seguros):
    py -3.12 tests/seed_super_dashboard.py | mysql --default-character-set=utf8mb4 \
        -h localhost -P 3306 -u seguros_user -puser_1234 seguros_web_db

Re-ejecutable: limpia sus propias pólizas (numero_poliza 'SUPER-...') antes de recrear.
La materia_asegurada usa las CLAVES de las plantillas (data/materiaPorRamo.js).
"""
import sys
import json
from datetime import date

# La salida SIEMPRE en UTF-8 (evita mojibake al redirigir a archivo en Windows).
sys.stdout.reconfigure(encoding="utf-8")

TODAY = date(2026, 7, 21)
CLIENTE = 2


def add_months(d, n):
    m = d.month - 1 + n
    y = d.year + m // 12
    m = m % 12 + 1
    return date(y, m, min(d.day, 28))


def s(v):
    """Valor SQL: None→NULL, str→'...', resto→str."""
    if v is None:
        return "NULL"
    if isinstance(v, str):
        return "'" + v.replace("'", "''") + "'"
    return str(v)


POLIZAS = [
    {
        "numero": "SUPER-AUTO-001", "ramo": "auto", "compania": "Zurich",
        "producto": "Auto Full", "materia_txt": "Camioneta Toyota Hilux",
        "inicio": date(2026, 2, 1), "venc": date(2027, 2, 1),
        "prima": 18.00, "monto_aseg": None, "num_cuotas": 12, "monto_cuota": 1.50,
        "cuota_inicio": date(2026, 2, 5), "forma_pago": "PAC",
        "materia": {
            "tipo_auto": "Camioneta", "marca": "Toyota", "modelo": "Hilux",
            "patente": "KXPR45", "anio": 2023, "estado_vehiculo": "Usado",
            "uso": "Particular",
        },
        "docs": [("Póliza Seguro de Auto", "Póliza")],
    },
    {
        "numero": "SUPER-HOGAR-001", "ramo": "hogar", "compania": "HDI",
        "producto": "Incendio + Sismo", "materia_txt": "Casa habitación",
        "inicio": date(2025, 8, 10), "venc": date(2026, 8, 10),  # POR VENCER → alerta
        "prima": 15.00, "monto_aseg": 6500, "num_cuotas": 12, "monto_cuota": 1.25,
        "cuota_inicio": date(2025, 8, 15), "forma_pago": "AVISO CUOTA",
        "materia": {
            "tipo_vivienda": "Casa", "cantidad_pisos": 2, "uso": "Habitacional",
            "tipo_construccion": "Sólido - Concreto", "metros_construidos": 120,
            "anio_construccion": 2015, "monto_edificacion": 5000,
            "monto_contenidos": 1500, "cerca_canal_rio": "No",
            "cerca_borde_costero": "No", "deshabitada_30_dias": "No",
            "pareada_ambos_costados": "No", "bomberos_mas_10km": "No",
            "coberturas_opcionales": "Adicional Sismo",
        },
        "docs": [("Póliza Seguro de Hogar", "Póliza"),
                 ("Certificado de cobertura", "Certificado")],
    },
    {
        "numero": "SUPER-MUJER-001", "ramo": "mujer_segura", "compania": "HDI",
        "producto": "Mujer Segura", "materia_txt": "Accidentes personales",
        "inicio": date(2026, 3, 1), "venc": date(2027, 3, 1),
        "prima": 0.33, "monto_aseg": None, "num_cuotas": 1, "monto_cuota": 0.33,
        "cuota_inicio": date(2026, 3, 5), "forma_pago": "Contado",
        "materia": {"actividad": "Ingeniera comercial"},
        "docs": [],
    },
    {
        "numero": "SUPER-GARANTIA-001", "ramo": "garantias", "compania": "Consorcio",
        "producto": "Boleta de garantía", "materia_txt": "Fiel cumplimiento",
        "inicio": date(2026, 4, 1), "venc": date(2027, 4, 1),
        "prima": 8.00, "monto_aseg": 500, "num_cuotas": 4, "monto_cuota": 2.00,
        "cuota_inicio": date(2026, 4, 10), "forma_pago": "PAC",
        "materia": {
            "tipo_garantia": "Fiel Cumplimiento", "metodo_liquidacion": "A la vista",
            "tipo_mandante": "Público", "razon_social": "Constructora Andes SpA",
            "glosa": "Contrato obra pública Ruta 5", "vigencia_inicial": "2026-04-01",
            "vigencia_final": "2027-04-01", "monto_asegurado_uf": 500,
        },
        "docs": [("Póliza Garantía", "Póliza")],
    },
    {
        "numero": "SUPER-ACC-001", "ramo": "accidentes", "compania": "HDI",
        "producto": "Accidentes Personales", "materia_txt": "Accidentes personales",
        "inicio": date(2026, 6, 1), "venc": date(2027, 6, 1),
        "prima": 2.50, "monto_aseg": 500, "num_cuotas": 10, "monto_cuota": 0.25,
        "cuota_inicio": date(2026, 6, 5), "forma_pago": "PAC",
        "materia": {"actividad": "Empleado", "capital_asegurado_uf": "500"},
        "docs": [],
    },
]

out = ["SET NAMES utf8mb4;", ""]
numeros = ",".join(s(p["numero"]) for p in POLIZAS)

# Limpieza re-ejecutable (hijos primero).
out.append(f"DELETE d FROM web_documentos_cliente d JOIN web_polizas p "
           f"ON d.poliza_id=p.id_poliza WHERE p.numero_poliza IN ({numeros});")
out.append(f"DELETE b FROM web_poliza_beneficiarios b JOIN web_polizas p "
           f"ON b.poliza_id=p.id_poliza WHERE p.numero_poliza IN ({numeros});")
out.append(f"DELETE FROM web_poliza_pagos WHERE poliza_id IN "
           f"(SELECT id_poliza FROM web_polizas WHERE numero_poliza IN ({numeros}));")
out.append(f"DELETE FROM web_polizas WHERE numero_poliza IN ({numeros});")
out.append("")

for p in POLIZAS:
    # Cuotas: pagadas si vencen antes de hoy; el próximo pago = 1ª pendiente.
    cuotas, proximo = [], None
    for i in range(p["num_cuotas"]):
        fv = add_months(p["cuota_inicio"], i)
        if fv < TODAY:
            cuotas.append((i + 1, p["monto_cuota"], fv, fv, "pagada",
                           "Tarjeta de crédito", f"TRX-{p['numero']}-{i + 1:03d}"))
        else:
            cuotas.append((i + 1, p["monto_cuota"], fv, None, "pendiente", None, None))
            if proximo is None:
                proximo = fv
    prox = proximo or add_months(p["cuota_inicio"], p["num_cuotas"] - 1)
    materia = json.dumps(p["materia"], ensure_ascii=False)

    out.append(
        "INSERT INTO web_polizas (cliente_id, seguro_id, numero_poliza, compania, "
        "ramo, materia, producto, fecha_inicio, fecha_vencimiento, prima, "
        "monto_asegurado, estado, origen, forma_pago, frecuencia_pago, num_cuotas, "
        "monto_cuota, fecha_proximo_pago, materia_asegurada) VALUES ("
        f"{CLIENTE}, (SELECT id_seguro FROM web_seguros_catalogo WHERE ramo={s(p['ramo'])} LIMIT 1), "
        f"{s(p['numero'])}, {s(p['compania'])}, {s(p['ramo'])}, {s(p['materia_txt'])}, "
        f"{s(p['producto'])}, {s(p['inicio'].isoformat())}, {s(p['venc'].isoformat())}, "
        f"{p['prima']}, {s(p['monto_aseg'])}, 'activa', 'manual', {s(p['forma_pago'])}, "
        f"'mensual', {p['num_cuotas']}, {p['monto_cuota']}, {s(prox.isoformat())}, {s(materia)});"
    )
    out.append("SET @pol = LAST_INSERT_ID();")

    filas = ",\n".join(
        f"(@pol, {n}, {m}, {s(fv.isoformat())}, {s(fp.isoformat() if fp else None)}, "
        f"{s(est)}, {s(met)}, {s(ref)})"
        for (n, m, fv, fp, est, met, ref) in cuotas
    )
    out.append(
        "INSERT INTO web_poliza_pagos (poliza_id, numero_cuota, monto, "
        "fecha_vencimiento, fecha_pago, estado, metodo_pago, referencia_transaccion) "
        f"VALUES\n{filas};"
    )

    for nombre, tipo in p["docs"]:
        out.append(
            "INSERT INTO web_documentos_cliente (cliente_id, poliza_id, nombre, tipo, "
            f"estado, url) VALUES ({CLIENTE}, @pol, {s(nombre)}, {s(tipo)}, 'Disponible', NULL);"
        )
    out.append("")

print("\n".join(out))
