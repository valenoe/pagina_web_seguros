import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from database import get_db
from models.catalogo import SeguroCatalogo
from models.cliente import Cliente, ClienteEmail, ClienteTelefono
from models.contacto import LeadContacto
from models.cotizacion import Cotizacion
from models.imagen import Imagen
from models.poliza import Poliza, PolizaPago
from models.usuario_interno import UsuarioInterno
from services.username import generar_username
from schemas.admin import (
    SeguroIn, SeguroAdminOut,
    ClienteIn, ClienteAdminOut,
    PolizaIn, PolizaAdminOut,
    PagoIn, PagoAdminOut,
    ImagenIn, ImagenOut,
    UsuarioInternoIn, UsuarioInternoUpdate, UsuarioInternoAdminOut,
    LeadAdminOut, CotizacionAdminOut,
)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

router = APIRouter(prefix="/admin", tags=["Admin"])
oauth2_admin = OAuth2PasswordBearer(tokenUrl="/auth/admin/login")


def get_usuario_activo(
    token: str = Depends(oauth2_admin),
    db: Session = Depends(get_db),
) -> UsuarioInterno:
    exc = HTTPException(status_code=401, detail="Token inválido o expirado")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None or payload.get("tipo") != "interno":
            raise exc
    except JWTError:
        raise exc
    usuario = db.query(UsuarioInterno).filter(
        UsuarioInterno.id_usuario == int(uid),
        UsuarioInterno.activo == True,
    ).first()
    if not usuario:
        raise exc
    return usuario


def solo_admin(usuario: UsuarioInterno = Depends(get_usuario_activo)) -> UsuarioInterno:
    if usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol admin")
    return usuario


# ── Leads (solo lectura) ──────────────────────────────────────────────────────

@router.get("/leads", response_model=list[LeadAdminOut])
def listar_leads(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(LeadContacto).order_by(LeadContacto.fecha_contacto.desc()).all()


# ── Cotizaciones (solo lectura) ───────────────────────────────────────────────

@router.get("/cotizaciones", response_model=list[CotizacionAdminOut])
def listar_cotizaciones(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(Cotizacion).order_by(Cotizacion.fecha_solicitud.desc()).all()

@router.get("/cotizaciones/{id_cotizacion}", response_model=CotizacionAdminOut)
def obtener_cotizacion(id_cotizacion: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    obj = db.query(Cotizacion).filter(Cotizacion.id_cotizacion == id_cotizacion).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    return obj


# ── Seguros ───────────────────────────────────────────────────────────────────

@router.get("/seguros", response_model=list[SeguroAdminOut])
def listar_seguros(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(SeguroCatalogo).order_by(SeguroCatalogo.orden_display).all()

@router.get("/seguros/{id_seguro}", response_model=SeguroAdminOut)
def obtener_seguro(id_seguro: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    obj = db.query(SeguroCatalogo).filter(SeguroCatalogo.id_seguro == id_seguro).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    return obj

@router.post("/seguros", response_model=SeguroAdminOut, status_code=201)
def crear_seguro(datos: SeguroIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = SeguroCatalogo(**datos.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/seguros/{id_seguro}", response_model=SeguroAdminOut)
def actualizar_seguro(id_seguro: int, datos: SeguroIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(SeguroCatalogo).filter(SeguroCatalogo.id_seguro == id_seguro).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    for k, v in datos.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/seguros/{id_seguro}", status_code=204)
def eliminar_seguro(id_seguro: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(SeguroCatalogo).filter(SeguroCatalogo.id_seguro == id_seguro).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(obj)
    db.commit()


# ── Clientes ──────────────────────────────────────────────────────────────────

@router.get("/clientes", response_model=list[ClienteAdminOut])
def listar_clientes(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(Cliente).order_by(Cliente.fecha_registro.desc()).all()

@router.get("/clientes/{id_cliente}", response_model=ClienteAdminOut)
def obtener_cliente(id_cliente: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    obj = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    return obj

@router.post("/clientes", response_model=ClienteAdminOut, status_code=201)
def crear_cliente(datos: ClienteIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    datos_dict = datos.model_dump()
    email = datos_dict.pop("email", None)
    telefono = datos_dict.pop("telefono", None)
    obj = Cliente(**datos_dict)
    db.add(obj)
    db.flush()
    if email:
        db.add(ClienteEmail(cliente_id=obj.id_cliente, email=email))
    if telefono:
        db.add(ClienteTelefono(cliente_id=obj.id_cliente, telefono=telefono, tipo="telefono"))
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/clientes/{id_cliente}", response_model=ClienteAdminOut)
def actualizar_cliente(id_cliente: int, datos: ClienteIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    datos_dict = datos.model_dump()
    email = datos_dict.pop("email", None)
    telefono = datos_dict.pop("telefono", None)
    for k, v in datos_dict.items():
        setattr(obj, k, v)
    db.query(ClienteEmail).filter(ClienteEmail.cliente_id == id_cliente).delete()
    if email:
        db.add(ClienteEmail(cliente_id=id_cliente, email=email))
    db.query(ClienteTelefono).filter(
        ClienteTelefono.cliente_id == id_cliente,
        ClienteTelefono.tipo == "telefono",
    ).delete()
    if telefono:
        db.add(ClienteTelefono(cliente_id=id_cliente, telefono=telefono, tipo="telefono"))
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/clientes/{id_cliente}", status_code=204)
def eliminar_cliente(id_cliente: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(obj)
    db.commit()


# ── Pólizas ───────────────────────────────────────────────────────────────────

@router.get("/polizas", response_model=list[PolizaAdminOut])
def listar_polizas(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(Poliza).order_by(Poliza.id_poliza.desc()).all()

@router.get("/polizas/{id_poliza}", response_model=PolizaAdminOut)
def obtener_poliza(id_poliza: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    obj = db.query(Poliza).filter(Poliza.id_poliza == id_poliza).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    return obj

@router.post("/polizas", response_model=PolizaAdminOut, status_code=201)
def crear_poliza(datos: PolizaIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = Poliza(**datos.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/polizas/{id_poliza}", response_model=PolizaAdminOut)
def actualizar_poliza(id_poliza: int, datos: PolizaIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Poliza).filter(Poliza.id_poliza == id_poliza).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    for k, v in datos.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/polizas/{id_poliza}", status_code=204)
def eliminar_poliza(id_poliza: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Poliza).filter(Poliza.id_poliza == id_poliza).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    db.delete(obj)
    db.commit()


# ── Pagos de pólizas ──────────────────────────────────────────────────────────

@router.get("/polizas/{id_poliza}/pagos", response_model=list[PagoAdminOut])
def listar_pagos(id_poliza: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    if not db.query(Poliza).filter(Poliza.id_poliza == id_poliza).first():
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return db.query(PolizaPago).filter(PolizaPago.poliza_id == id_poliza).order_by(PolizaPago.numero_cuota).all()

@router.post("/polizas/{id_poliza}/pagos", response_model=PagoAdminOut, status_code=201)
def crear_pago(id_poliza: int, datos: PagoIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    if not db.query(Poliza).filter(Poliza.id_poliza == id_poliza).first():
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    obj = PolizaPago(poliza_id=id_poliza, **datos.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/pagos/{id_pago}", response_model=PagoAdminOut)
def actualizar_pago(id_pago: int, datos: PagoIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(PolizaPago).filter(PolizaPago.id_pago == id_pago).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    for k, v in datos.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


# ── Imágenes ──────────────────────────────────────────────────────────────────

@router.get("/imagenes", response_model=list[ImagenOut])
def listar_imagenes(db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    return db.query(Imagen).order_by(Imagen.id_imagen.desc()).all()

@router.get("/imagenes/{id_imagen}", response_model=ImagenOut)
def obtener_imagen(id_imagen: int, db: Session = Depends(get_db), _=Depends(get_usuario_activo)):
    obj = db.query(Imagen).filter(Imagen.id_imagen == id_imagen).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    return obj

@router.post("/imagenes", response_model=ImagenOut, status_code=201)
def crear_imagen(datos: ImagenIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = Imagen(**datos.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/imagenes/{id_imagen}", response_model=ImagenOut)
def actualizar_imagen(id_imagen: int, datos: ImagenIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Imagen).filter(Imagen.id_imagen == id_imagen).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    for k, v in datos.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/imagenes/{id_imagen}", status_code=204)
def eliminar_imagen(id_imagen: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(Imagen).filter(Imagen.id_imagen == id_imagen).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrada")
    db.delete(obj)
    db.commit()


# ── Usuarios internos (solo admin) ────────────────────────────────────────────

@router.get("/usuarios", response_model=list[UsuarioInternoAdminOut])
def listar_usuarios(db: Session = Depends(get_db), _=Depends(solo_admin)):
    return db.query(UsuarioInterno).order_by(UsuarioInterno.id_usuario).all()

@router.get("/usuarios/{id_usuario}", response_model=UsuarioInternoAdminOut)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(UsuarioInterno).filter(UsuarioInterno.id_usuario == id_usuario).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    return obj

@router.post("/usuarios", response_model=UsuarioInternoAdminOut, status_code=201)
def crear_usuario(datos: UsuarioInternoIn, db: Session = Depends(get_db), _=Depends(solo_admin)):
    if db.query(UsuarioInterno).filter(UsuarioInterno.email == datos.email).first():
        raise HTTPException(status_code=409, detail="Email ya registrado")
    username = datos.username or generar_username(datos.nombre, db, UsuarioInterno)
    if db.query(UsuarioInterno).filter(UsuarioInterno.username == username).first():
        raise HTTPException(status_code=409, detail="Username ya existe")
    ph = bcrypt.hashpw(datos.password.encode(), bcrypt.gensalt()).decode()
    obj = UsuarioInterno(nombre=datos.nombre, email=datos.email, username=username, password_hash=ph, rol=datos.rol, activo=datos.activo)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/usuarios/{id_usuario}", response_model=UsuarioInternoAdminOut)
def actualizar_usuario(id_usuario: int, datos: UsuarioInternoUpdate, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(UsuarioInterno).filter(UsuarioInterno.id_usuario == id_usuario).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    if datos.username != obj.username:
        if db.query(UsuarioInterno).filter(UsuarioInterno.username == datos.username, UsuarioInterno.id_usuario != id_usuario).first():
            raise HTTPException(status_code=409, detail="Username ya existe")
    obj.nombre = datos.nombre
    obj.email = datos.email
    obj.username = datos.username
    obj.rol = datos.rol
    obj.activo = datos.activo
    if datos.password:
        obj.password_hash = bcrypt.hashpw(datos.password.encode(), bcrypt.gensalt()).decode()
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/usuarios/{id_usuario}", status_code=204)
def eliminar_usuario(id_usuario: int, db: Session = Depends(get_db), _=Depends(solo_admin)):
    obj = db.query(UsuarioInterno).filter(UsuarioInterno.id_usuario == id_usuario).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(obj)
    db.commit()
