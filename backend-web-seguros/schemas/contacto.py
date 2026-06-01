from pydantic import BaseModel, EmailStr
from datetime import datetime

# lo que el frontend envía al backend
class ContactoIn(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str | None = None
    mensaje: str | None = None

# lo que el backend devuelve al frontend
class ContactoOut(BaseModel):
    id_lead: int
    nombre: str
    email: str
    telefono: str | None
    mensaje: str | None
    fecha_contacto: datetime

    model_config = {"from_attributes": True}
