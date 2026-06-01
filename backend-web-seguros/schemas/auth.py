from typing import Literal
from pydantic import BaseModel


class LoginIn(BaseModel):
    rut: str
    tipo_cliente: Literal["persona", "empresa"]
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
