import re
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

class ContactoIn(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str | None = None
    mensaje: str | None = None

    @field_validator("telefono", mode="before")
    @classmethod
    def validar_telefono(cls, v):
        if v is None or v == "":
            return None
        v = re.sub(r"\s+", "", v)
        if not re.match(r"^\+\d{7,15}$", v):
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
