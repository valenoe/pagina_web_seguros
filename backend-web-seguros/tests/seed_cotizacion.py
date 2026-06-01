import json
from database import SessionLocal
from models.cotizacion import Cotizacion

COTIZACION = {
    "seguro_id": 2,
    "nombre": "Rodrigo Ignacio Sepúlveda Mora",
    "rut": "15.342.891-7",
    "tipo_cliente": "persona",
    "email": "rodrigo.sepulveda@gmail.com",
    "telefono": "+56 9 7651 3482",
    "canal": "digital",
    "mensaje": "Busco cobertura para mi auto, uso particular, sin siniestros previos.",
    "datos_adicionales": json.dumps({
        "marca": "Suzuki",
        "modelo": "Swift",
        "anio": 2021,
        "patente": "FKRB-21",
        "uso": "particular",
    }, ensure_ascii=False),
}


def seed():
    db = SessionLocal()
    try:
        cotizacion = Cotizacion(**COTIZACION)
        db.add(cotizacion)
        db.commit()
        db.refresh(cotizacion)
        print(f"Cotización insertada: [{cotizacion.id_cotizacion}] {cotizacion.nombre} — seguro_id {cotizacion.seguro_id} — estado: {cotizacion.estado}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
