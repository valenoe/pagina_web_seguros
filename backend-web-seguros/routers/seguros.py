from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.catalogo import SeguroCatalogo
from schemas.seguro import SeguroOut

router = APIRouter(prefix="/seguros", tags=["Seguros"])


@router.get("/", response_model=list[SeguroOut])
def listar_seguros(db: Session = Depends(get_db)):
    return (
        db.query(SeguroCatalogo)
        .filter(SeguroCatalogo.seguro_activo == True)
        .order_by(SeguroCatalogo.orden_display)
        .all()
    )


@router.get("/{id_seguro}", response_model=SeguroOut)
def obtener_seguro(id_seguro: int, db: Session = Depends(get_db)):
    seguro = db.query(SeguroCatalogo).filter(SeguroCatalogo.id_seguro == id_seguro).first()
    if not seguro:
        raise HTTPException(status_code=404, detail="Seguro no encontrado")
    return seguro
