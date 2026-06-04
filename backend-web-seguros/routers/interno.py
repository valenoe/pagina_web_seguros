import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from database import get_db
from models.usuario_interno import UsuarioInterno
from schemas.usuario_interno import LoginInterno, TokenInterno

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
LINK_SISTEMA_EXTERNO = os.getenv("LINK_SISTEMA_EXTERNO", "")

router = APIRouter(prefix="/interno", tags=["Interno"])

oauth2_interno = OAuth2PasswordBearer(tokenUrl="/interno/auth/login")

_CREDENCIALES_INVALIDAS = HTTPException(status_code=401, detail="Credenciales inválidas")


def get_current_interno(
    token: str = Depends(oauth2_interno),
    db: Session = Depends(get_db),
) -> UsuarioInterno:
    credenciales_invalidas = HTTPException(status_code=401, detail="Token inválido o expirado")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None or payload.get("tipo") != "interno":
            raise credenciales_invalidas
    except JWTError:
        raise credenciales_invalidas

    usuario = db.query(UsuarioInterno).filter(
        UsuarioInterno.id_usuario == int(usuario_id),
        UsuarioInterno.activo == True,
    ).first()
    if not usuario:
        raise credenciales_invalidas

    return usuario


@router.post("/auth/login", response_model=TokenInterno)
def login_interno(datos: LoginInterno, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    usuario = db.query(UsuarioInterno).filter(
        or_(UsuarioInterno.username == datos.login, UsuarioInterno.email == datos.login),
        UsuarioInterno.activo == True,
    ).first()
    if not usuario:
        raise _CREDENCIALES_INVALIDAS

    if not bcrypt.checkpw(datos.password.encode(), usuario.password_hash.encode()):
        raise _CREDENCIALES_INVALIDAS

    usuario.ultimo_ingreso = datetime.now(timezone.utc)
    db.commit()

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": str(usuario.id_usuario), "email": usuario.email, "rol": usuario.rol, "tipo": "interno", "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/link-sistema")
def get_link_sistema(usuario: UsuarioInterno = Depends(get_current_interno)):
    if not LINK_SISTEMA_EXTERNO:
        raise HTTPException(status_code=503, detail="Link del sistema externo no configurado")
    return {"url": LINK_SISTEMA_EXTERNO, "usuario": usuario.nombre, "rol": usuario.rol}
