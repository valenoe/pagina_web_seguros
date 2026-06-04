import json
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
