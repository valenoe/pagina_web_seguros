import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt
from dotenv import load_dotenv
from database import get_db
from models.cliente import Cliente, PortalAcceso
from schemas.auth import LoginIn, TokenOut

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

router = APIRouter(prefix="/auth", tags=["Auth"])

_CREDENCIALES_INVALIDAS = HTTPException(status_code=401, detail="Credenciales inválidas")


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(
        Cliente.rut == datos.rut,
        Cliente.tipo_cliente == datos.tipo_cliente,
        Cliente.cliente_activo == True,
    ).first()
    if not cliente:
        raise _CREDENCIALES_INVALIDAS

    acceso = db.query(PortalAcceso).filter(
        PortalAcceso.cliente_id == cliente.id_cliente,
        PortalAcceso.portal_acceso_activo == True,
    ).first()
    if not acceso or not acceso.password_hash:
        raise _CREDENCIALES_INVALIDAS

    if not bcrypt.checkpw(datos.password.encode(), acceso.password_hash.encode()):
        raise _CREDENCIALES_INVALIDAS

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": str(cliente.id_cliente), "rut": cliente.rut, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}
