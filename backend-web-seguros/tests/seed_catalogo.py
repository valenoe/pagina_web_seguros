from database import SessionLocal
from models.catalogo import SeguroCatalogo

SEGUROS = [
    {
        "nombre": "Seguro de Accidentes Personales",
        "descripcion": (
            "Cobertura ante lesiones, invalidez o fallecimiento producidos por accidentes. "
            "Incluye gastos médicos, indemnización por incapacidad temporal y capital por muerte accidental."
        ),
        "permite_digital": True,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 1,
    },
    {
        "nombre": "Seguro de Automóvil",
        "descripcion": (
            "Protección para tu vehículo ante daños propios, robo, responsabilidad civil y asistencia en ruta. "
            "Cotización según año, modelo y uso del vehículo."
        ),
        "permite_digital": True,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 2,
    },
    {
        "nombre": "Seguro de Incendio y Sismo",
        "descripcion": (
            "Cobertura para viviendas y locales comerciales ante incendio, rayo y sismo. "
            "Incluye daños estructurales y pérdida de contenido. Requiere tasación presencial."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 3,
    },
]


def seed():
    db = SessionLocal()
    try:
        existentes = {s.nombre for s in db.query(SeguroCatalogo.nombre).all()}
        nuevos = [SeguroCatalogo(**s) for s in SEGUROS if s["nombre"] not in existentes]

        if not nuevos:
            print("Los 3 seguros ya existen en la base de datos. No se insertó nada.")
            return

        db.add_all(nuevos)
        db.commit()
        print(f"{len(nuevos)} seguro(s) insertado(s):")
        for s in nuevos:
            print(f"  - {s.nombre}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
