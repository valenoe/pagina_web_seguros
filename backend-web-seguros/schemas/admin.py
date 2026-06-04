from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr


class SeguroIn(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    permite_digital: bool = False
    permite_tradicional: bool = True
    url_externa: Optional[str] = None
    seguro_activo: bool = True
    categoria: str = "Otros"
    orden_display: int = 0


class SeguroAdminOut(BaseModel):
    id_seguro: int
    nombre: str
    descripcion: Optional[str]
    permite_digital: bool
    permite_tradicional: bool
    url_externa: Optional[str]
    seguro_activo: bool
    categoria: str
    orden_display: int
    model_config = {"from_attributes": True}


class ClienteIn(BaseModel):
    rut: str
    tipo_cliente: Literal["persona", "empresa"]
    nombre_o_razon_social: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    cliente_activo: bool = True


class ClienteAdminOut(BaseModel):
    id_cliente: int
    rut: str
    tipo_cliente: str
    nombre_o_razon_social: str
    email: Optional[str]
    telefono: Optional[str]
    cliente_activo: bool
    fecha_registro: datetime
    model_config = {"from_attributes": True}


class PolizaIn(BaseModel):
    cliente_id: int
    seguro_id: int
    cotizacion_id: Optional[int] = None
    numero_poliza: Optional[str] = None
    compania: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    prima: Optional[Decimal] = None
    estado: str = "activa"
    origen: Literal["digital", "tradicional"]


class PolizaAdminOut(BaseModel):
    id_poliza: int
    cliente_id: int
    seguro_id: int
    cotizacion_id: Optional[int]
    numero_poliza: Optional[str]
    compania: Optional[str]
    fecha_inicio: Optional[date]
    fecha_vencimiento: Optional[date]
    prima: Optional[Decimal]
    estado: str
    origen: str
    model_config = {"from_attributes": True}


class ImagenIn(BaseModel):
    nombre: str
    url: str
    descripcion: Optional[str] = None
    seccion: Optional[str] = None
    activo: bool = True


class ImagenOut(BaseModel):
    id_imagen: int
    nombre: str
    url: str
    descripcion: Optional[str]
    seccion: Optional[str]
    activo: bool
    fecha_creacion: datetime
    model_config = {"from_attributes": True}


class UsuarioInternoIn(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    username: Optional[str] = None  # si no se provee, se genera automáticamente
    rol: Literal["admin", "agente"] = "agente"
    activo: bool = True


class UsuarioInternoUpdate(BaseModel):
    nombre: str
    email: EmailStr
    username: str
    password: Optional[str] = None
    rol: Literal["admin", "agente"]
    activo: bool


class UsuarioInternoAdminOut(BaseModel):
    id_usuario: int
    username: str
    nombre: str
    email: str
    rol: str
    activo: bool
    fecha_creacion: datetime
    ultimo_ingreso: Optional[datetime]
    model_config = {"from_attributes": True}


class LeadAdminOut(BaseModel):
    id_lead: int
    nombre: str
    email: str
    telefono: Optional[str]
    mensaje: Optional[str]
    fecha_contacto: datetime
    model_config = {"from_attributes": True}


class CotizacionAdminOut(BaseModel):
    id_cotizacion: int
    seguro_id: int
    cliente_id: Optional[int]
    nombre: str
    rut: str
    tipo_cliente: str
    email: str
    telefono: str
    canal: str
    estado: str
    mensaje: Optional[str]
    fecha_solicitud: datetime
    model_config = {"from_attributes": True}
