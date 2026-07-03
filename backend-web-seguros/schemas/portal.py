from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, model_validator


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
    email: Optional[str] = None
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None
    region: Optional[str] = None
    comuna: Optional[str] = None
    foto_perfil: Optional[str] = None
    telefonos: list[TelefonoOut] = []
    emails: list[EmailOut] = []

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def campos_desde_listas(self):
        # teléfono y whatsapp se derivan por TIPO (no por posición en la lista)
        if self.telefono is None:
            tel = next((t for t in self.telefonos if t.tipo == "telefono"), None)
            self.telefono = tel.telefono if tel else None
        if self.whatsapp is None:
            wsp = next((t for t in self.telefonos if t.tipo == "whatsapp"), None)
            self.whatsapp = wsp.telefono if wsp else None
        if self.email is None and self.emails:
            self.email = self.emails[0].email
        return self


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


class ClientePerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None
    region: Optional[str] = None
    comuna: Optional[str] = None


class PagoAgregadoOut(PagoPortalOut):
    poliza_id: int
    numero_poliza: Optional[str] = None
    seguro_nombre: Optional[str] = None


class CoberturaPortalOut(BaseModel):
    id_poliza: int
    seguro: Optional[SeguroResumen] = None
    compania: Optional[str] = None
    numero_poliza: Optional[str] = None
    coberturas: list = []

    model_config = {"from_attributes": True}


class BeneficiarioAgregadoOut(BeneficiarioOut):
    id_beneficiario: int
    poliza_id: int
    numero_poliza: Optional[str] = None


class SiniestroIn(BaseModel):
    poliza_id: int
    tipo: str
    descripcion: Optional[str] = None
    fecha_ocurrencia: Optional[date] = None


class SiniestroOut(BaseModel):
    id_siniestro: int
    poliza_id: int
    tipo: str
    descripcion: Optional[str] = None
    fecha_ocurrencia: Optional[date] = None
    etapa: int
    estado: str
    fecha_registro: datetime
    numero_poliza: Optional[str] = None
    seguro_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class DocumentoClienteOut(BaseModel):
    id_documento: int
    poliza_id: Optional[int] = None
    nombre: str
    tipo: str
    estado: str
    url: Optional[str] = None
    fecha_emision: datetime
    numero_poliza: Optional[str] = None
    seguro_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class MetodoPagoOut(BaseModel):
    id_metodo: int
    tipo: str
    descripcion: Optional[str] = None
    ultimo4: Optional[str] = None
    activo: bool

    model_config = {"from_attributes": True}


class AlertaOut(BaseModel):
    id_alerta: str
    tipo: str
    titulo: str
    mensaje: str
