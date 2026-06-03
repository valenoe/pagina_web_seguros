from database import SessionLocal
from models.catalogo import SeguroCatalogo

SEGUROS = [
    {
        "nombre": "Seguro de Autos",
        "categoria": "Vehículos",
        "descripcion": (
            "Cobertura completa para tu vehículo ante accidentes, robo, daños materiales y responsabilidad civil. "
            "Incluye vehículo de reemplazo y robo de accesorios."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 1,
    },
    {
        "nombre": "RCI Argentina",
        "categoria": "Vehículos",
        "descripcion": (
            "Seguro de Responsabilidad Civil Internacional para vehículos que ingresan a Argentina. "
            "Cobertura de 0,17 UF por día. Obligatorio para cruzar la frontera."
        ),
        "permite_digital": True,
        "permite_tradicional": True,
        "url_externa": "https://rcionline.bciseguros.cl/Seguro-Obligatorio-Argentina/Tarifa.aspx?r=NwA4ADQANAA3ADEAMQAxAA==&co=cAByAGkAbQBhAHIAeQA%3D",
        "seguro_activo": True,
        "orden_display": 2,
    },
    {
        "nombre": "SOAP",
        "categoria": "Vehículos",
        "descripcion": (
            "Seguro Obligatorio de Accidentes Personales causados por vehículos motorizados. "
            "Cubre lesiones y muerte de conductores, pasajeros y peatones."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 3,
    },
    {
        "nombre": "Seguro de Hogar",
        "categoria": "Personas",
        "descripcion": (
            "Protege tu vivienda ante incendio, sismo y daños en estructura y contenido. "
            "Incluye asistencias técnicas de cerrajería, cristalería, gasfitería y electricidad."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 4,
    },
    {
        "nombre": "Mujer Segura",
        "categoria": "Personas",
        "descripcion": (
            "Seguro de accidentes personales para mujeres de 18 a 80 años. "
            "Cubre muerte accidental, incapacidad total y permanente, desmembramiento y gastos de sepelio. "
            "Valor: 0,33 UF anual."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 5,
    },
    {
        "nombre": "Seguro de Accidentes Personales",
        "categoria": "Personas",
        "descripcion": (
            "Cobertura ante lesiones, invalidez o fallecimiento causados por accidentes. "
            "Protección para personas naturales con o sin actividad laboral."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 6,
    },
    {
        "nombre": "Asistencia en Viaje",
        "categoria": "Personas",
        "descripcion": (
            "Asistencia médica integral para viajes internacionales: hospitalización, repatriación, "
            "pérdida de equipaje y cancelación de viaje. Valor: 0,32 UF anual."
        ),
        "permite_digital": True,
        "permite_tradicional": True,
        "url_externa": "https://viajes.prietocorreaseguros.cl/",
        "seguro_activo": True,
        "orden_display": 7,
    },
    {
        "nombre": "Seguro de Mascotas",
        "categoria": "Personas",
        "descripcion": (
            "Cobertura veterinaria para perros y gatos ante accidentes y enfermedades. "
            "Planes Básico (0,15 UF/mes), Medio (0,26 UF/mes) y Full (0,40 UF/mes)."
        ),
        "permite_digital": True,
        "permite_tradicional": True,
        "url_externa": "https://cotizadormascotas.bciseguros.cl/inicio/26C75F16605805356643A23BCAED180E",
        "seguro_activo": True,
        "orden_display": 8,
    },
    {
        "nombre": "Seguro de Garantías",
        "categoria": "Empresas y otros",
        "descripcion": (
            "Asegura el cumplimiento contractual de tus compromisos con terceros en obras y licitaciones. "
            "Cubre seriedad de oferta, fiel cumplimiento, ejecución de obras y más."
        ),
        "permite_digital": False,
        "permite_tradicional": True,
        "url_externa": None,
        "seguro_activo": True,
        "orden_display": 9,
    },
]


def seed():
    db = SessionLocal()
    try:
        existentes = {s.nombre for s in db.query(SeguroCatalogo.nombre).all()}
        nuevos = [SeguroCatalogo(**s) for s in SEGUROS if s["nombre"] not in existentes]

        if not nuevos:
            print("Todos los seguros ya existen en la base de datos. No se insertó nada.")
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
