from typing import Literal, Optional
from pydantic import BaseModel


class RegistroIn(BaseModel):
    tipo_cliente: Literal["persona", "empresa"]
    nombre: str
    rut: str
    email: str
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    password: str


class LoginIn(BaseModel):
    rut: str
    tipo_cliente: Literal["persona", "empresa"]
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
