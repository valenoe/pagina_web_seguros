from pydantic import BaseModel


class LoginInterno(BaseModel):
    email: str
    password: str


class TokenInterno(BaseModel):
    access_token: str
    token_type: str
