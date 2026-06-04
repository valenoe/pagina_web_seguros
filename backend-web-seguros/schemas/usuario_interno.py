from pydantic import BaseModel


class LoginInterno(BaseModel):
    login: str  # acepta username o email
    password: str


class TokenInterno(BaseModel):
    access_token: str
    token_type: str
