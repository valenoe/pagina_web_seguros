import json
import re
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator


class CotizacionIn(BaseModel):
    id_seguro: int
    nombre: str
    rut: str
    tipo_cliente: Literal["persona", "empresa"]
    email: EmailStr
    telefono: str
    canal: Literal["digital", "tradicional"]
    mensaje: str | None = None
    datos_adicionales: dict | None = None

    @field_validator("telefono", mode="before")
    @classmethod
    def validar_telefono(cls, v):
        if not v:
            raise ValueError("El teléfono es requerido")
        v = re.sub(r"\s+", "", v)
        if not re.match(r"^\+\d{7,15}$", v):
            raise ValueError("Debe incluir código de país y solo dígitos (ej: +56912345678)")
        return v


class CotizacionOut(BaseModel):
    id_cotizacion: int
    id_seguro: int = Field(alias="seguro_id")
    cliente_id: int | None
    nombre: str
    rut: str
    tipo_cliente: str
    email: str
    telefono: str
    canal: str
    mensaje: str | None
    datos_adicionales: dict | None
    estado: str
    fecha_solicitud: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

    @field_validator("datos_adicionales", mode="before")
    @classmethod
    def deserializar_datos(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v
