from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class TelefonoOut(BaseModel):
    id_telefono: int
    telefono: str
    tipo: str

    model_config = {"from_attributes": True}


class EmailOut(BaseModel):
    id_email: int
    email: str

    model_config = {"from_attributes": True}


class ClientePerfilOut(BaseModel):
    id_cliente: int
    rut: str
    tipo_cliente: str
    nombre_o_razon_social: str
    email: Optional[str]
    telefono: Optional[str]
    telefonos: list[TelefonoOut] = []
    emails: list[EmailOut] = []

    model_config = {"from_attributes": True}


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


class PagoPortalOut(BaseModel):
    id_pago: int
    numero_cuota: int
    monto: Decimal
    fecha_vencimiento: date
    fecha_pago: date | None
    estado: str

    model_config = {"from_attributes": True}


class PolizaDetalleOut(PolizaPortalOut):
    beneficiarios: list[BeneficiarioOut]
    pagos: list[PagoPortalOut]
