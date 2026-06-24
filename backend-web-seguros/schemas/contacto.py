import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

class ContactoIn(BaseModel):
    # Límites alineados con las columnas de la BD (nombre/email 100, telefono 20)
    # para devolver un 422 limpio en vez de reventar en el INSERT.
    nombre: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=100)
    telefono: str | None = Field(default=None, max_length=20)
    mensaje: str | None = Field(default=None, max_length=2000)

    @field_validator("nombre", mode="before")
    @classmethod
    def limpiar_nombre(cls, v):
        # Evita que un nombre de solo espacios pase el min_length.
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("telefono", mode="before")
    @classmethod
    def validar_telefono(cls, v):
        if v is None or v == "":
            return None
        v = re.sub(r"\s+", "", v)
        # Mínimo 5 dígitos para coincidir con la validación del frontend.
        if not re.match(r"^\+\d{5,15}$", v):
            raise ValueError("Debe incluir código de país y solo dígitos (ej: +56912345678)")
        return v

# lo que el backend devuelve al frontend
class ContactoOut(BaseModel):
    id_lead: int
    nombre: str
    email: str
    telefono: str | None
    mensaje: str | None
    fecha_contacto: datetime

    model_config = {"from_attributes": True}
