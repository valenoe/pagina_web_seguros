from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from models.cliente import Cliente
from models.cotizacion import Cotizacion
from models.poliza import Poliza, PolizaPago
from schemas.portal import CotizacionPortalOut, PolizaPortalOut, PolizaDetalleOut, PagoPortalOut, ClientePerfilOut

router = APIRouter(prefix="/portal", tags=["Portal"])


@router.get("/perfil", response_model=ClientePerfilOut)
def mi_perfil(cliente: Cliente = Depends(get_current_user)):
    return cliente


@router.get("/mis-cotizaciones", response_model=list[CotizacionPortalOut])
def mis_cotizaciones(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Cotizacion)
        .filter(Cotizacion.cliente_id == cliente.id_cliente)
        .order_by(Cotizacion.fecha_solicitud.desc())
        .all()
    )


@router.get("/mis-polizas", response_model=list[PolizaPortalOut])
def mis_polizas(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Poliza)
        .filter(Poliza.cliente_id == cliente.id_cliente)
        .order_by(Poliza.fecha_inicio.desc())
        .all()
    )


@router.get("/mis-polizas/{id_poliza}", response_model=PolizaDetalleOut)
def detalle_poliza(
    id_poliza: int,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poliza = db.query(Poliza).filter(
        Poliza.id_poliza == id_poliza,
        Poliza.cliente_id == cliente.id_cliente,
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return poliza


@router.get("/mis-polizas/{id_poliza}/pagos", response_model=list[PagoPortalOut])
def pagos_poliza(
    id_poliza: int,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poliza = db.query(Poliza).filter(
        Poliza.id_poliza == id_poliza,
        Poliza.cliente_id == cliente.id_cliente,
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return db.query(PolizaPago).filter(PolizaPago.poliza_id == id_poliza).order_by(PolizaPago.numero_cuota).all()
