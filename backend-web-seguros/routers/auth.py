import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt
from dotenv import load_dotenv
from database import get_db
from models.cliente import Cliente, ClienteEmail, ClienteTelefono, PortalAcceso
from models.usuario_interno import UsuarioInterno
from schemas.auth import LoginIn, TokenOut, RegistroIn
from schemas.usuario_interno import LoginInterno

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

router = APIRouter(prefix="/auth", tags=["Auth"])

_CREDENCIALES_INVALIDAS = HTTPException(status_code=401, detail="Credenciales inválidas")


@router.post("/registro", status_code=201)
def registro(datos: RegistroIn, db: Session = Depends(get_db)):
    cliente_existente = db.query(Cliente).filter(Cliente.rut == datos.rut).first()

    if cliente_existente and cliente_existente.cliente_activo:
        raise HTTPException(status_code=409, detail="El RUT ya está registrado")

    ph = bcrypt.hashpw(datos.password.encode(), bcrypt.gensalt()).decode()

    if cliente_existente:
        # Reactivar cliente desactivado con datos nuevos
        cliente = cliente_existente
        cliente.nombre_o_razon_social = datos.nombre
        cliente.tipo_cliente = datos.tipo_cliente
        cliente.email = datos.email
        cliente.telefono = datos.telefono
        cliente.cliente_activo = True
        db.flush()
        acceso = db.query(PortalAcceso).filter(PortalAcceso.cliente_id == cliente.id_cliente).first()
        if acceso:
            acceso.password_hash = ph
            acceso.portal_acceso_activo = True
            acceso.tiene_cuenta = True
        else:
            db.add(PortalAcceso(cliente_id=cliente.id_cliente, tipo_acceso="web", pin_hash="", password_hash=ph, tiene_cuenta=True))
    else:
        cliente = Cliente(
            rut=datos.rut,
            tipo_cliente=datos.tipo_cliente,
            nombre_o_razon_social=datos.nombre,
            email=datos.email,
            telefono=datos.telefono,
        )
        db.add(cliente)
        db.flush()
        db.add(PortalAcceso(cliente_id=cliente.id_cliente, tipo_acceso="web", pin_hash="", password_hash=ph, tiene_cuenta=True))

    # Reemplazar teléfonos y emails auxiliares
    db.query(ClienteTelefono).filter(ClienteTelefono.cliente_id == cliente.id_cliente).delete()
    db.query(ClienteEmail).filter(ClienteEmail.cliente_id == cliente.id_cliente).delete()
    if datos.telefono:
        db.add(ClienteTelefono(cliente_id=cliente.id_cliente, telefono=datos.telefono, tipo="telefono"))
    if datos.whatsapp:
        db.add(ClienteTelefono(cliente_id=cliente.id_cliente, telefono=datos.whatsapp, tipo="whatsapp"))
    if datos.email:
        db.add(ClienteEmail(cliente_id=cliente.id_cliente, email=datos.email))

    db.commit()
    return {"mensaje": "Cuenta creada exitosamente"}


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


@router.post("/admin/login", response_model=TokenOut)
def login_admin(datos: LoginInterno, db: Session = Depends(get_db)):
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
