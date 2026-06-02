from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class SeguroResumen(BaseModel):
    id_seguro: int
    nombre: str

    model_config = {"from_attributes": True}


class CotizacionPortalOut(BaseModel):
    id_cotizacion: int
    seguro: SeguroResumen
    canal: str
    estado: str
    fecha_solicitud: datetime

    model_config = {"from_attributes": True}


class BeneficiarioOut(BaseModel):
    nombre: str
    rut: str | None
    relacion: str | None

    model_config = {"from_attributes": True}


class PolizaPortalOut(BaseModel):
    id_poliza: int
    seguro: SeguroResumen
    numero_poliza: str | None
    compania: str | None
    fecha_inicio: date | None
    fecha_vencimiento: date | None
    prima: Decimal | None
    estado: str

    model_config = {"from_attributes": True}


class PolizaDetalleOut(PolizaPortalOut):
    beneficiarios: list[BeneficiarioOut]
