import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.catalogo import SeguroCatalogo
from models.cotizacion import Cotizacion
from schemas.cotizacion import CotizacionIn, CotizacionOut

router = APIRouter(prefix="/cotizaciones", tags=["Cotizaciones"])

# Endpoint para crear una nueva cotización
# Revisa si el seguro existe y está activo, luego guarda la cotización en la base de datos y devuelve la cotización creada con su ID y fecha de solicitud.
@router.post("/", response_model=CotizacionOut, status_code=201)
def crear_cotizacion(datos: CotizacionIn, db: Session = Depends(get_db)):
    seguro = db.query(SeguroCatalogo).filter(
        SeguroCatalogo.id_seguro == datos.id_seguro,
        SeguroCatalogo.seguro_activo == True,
    ).first()
    if not seguro:
        raise HTTPException(status_code=404, detail="Seguro no encontrado o inactivo")

    payload = datos.model_dump()
    payload["seguro_id"] = payload.pop("id_seguro")

    if payload["datos_adicionales"] is not None:
        payload["datos_adicionales"] = json.dumps(payload["datos_adicionales"], ensure_ascii=False)

    cotizacion = Cotizacion(**payload)
    db.add(cotizacion)
    db.commit()
    db.refresh(cotizacion)
    return cotizacion
