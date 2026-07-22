import json
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from models.cliente import Cliente
from models.cotizacion import Cotizacion
from models.documento import DocumentoCliente
from models.metodo_pago import MetodoPago
from models.poliza import Poliza, PolizaPago, Beneficiario
from models.siniestro import Siniestro
from schemas.portal import (
    CotizacionPortalOut, PolizaPortalOut, PolizaDetalleOut,
    PagoPortalOut, ClientePerfilOut, ClientePerfilUpdate, CambioPasswordIn,
    PagoAgregadoOut, CoberturaPortalOut, BeneficiarioAgregadoOut,
    SiniestroIn, SiniestroOut,
    DocumentoClienteOut, MetodoPagoOut, AlertaOut,
)

UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
EXTENSIONES_IMAGEN = {".jpg", ".jpeg", ".png", ".webp"}
EXTENSIONES_DOCUMENTO = {".pdf", ".jpg", ".jpeg", ".png"}

router = APIRouter(prefix="/portal", tags=["Portal"])


@router.get("/perfil", response_model=ClientePerfilOut)
def mi_perfil(cliente: Cliente = Depends(get_current_user)):
    return cliente


@router.put("/perfil", response_model=ClientePerfilOut)
def actualizar_perfil(
    datos: ClientePerfilUpdate,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if datos.nombre is not None:
        cliente.nombre_o_razon_social = datos.nombre
    if datos.fecha_nacimiento is not None:
        cliente.fecha_nacimiento = datos.fecha_nacimiento
    if datos.direccion is not None:
        cliente.direccion = datos.direccion
    if datos.region is not None:
        cliente.region = datos.region
    if datos.comuna is not None:
        cliente.comuna = datos.comuna
    if datos.preferencias_notificacion is not None:
        import json
        cliente.preferencias_notificacion = json.dumps(datos.preferencias_notificacion)
    if datos.email is not None:
        from models.cliente import ClienteEmail
        email_principal = db.query(ClienteEmail).filter(
            ClienteEmail.cliente_id == cliente.id_cliente,
        ).first()
        if email_principal:
            email_principal.email = datos.email
        else:
            db.add(ClienteEmail(cliente_id=cliente.id_cliente, email=datos.email))
    # teléfono y whatsapp viven en web_cliente_telefonos distinguidos por `tipo`;
    # se actualiza (o crea) la fila del tipo correspondiente.
    def guardar_telefono(tipo, valor):
        from models.cliente import ClienteTelefono
        fila = db.query(ClienteTelefono).filter(
            ClienteTelefono.cliente_id == cliente.id_cliente,
            ClienteTelefono.tipo == tipo,
        ).first()
        if fila:
            fila.telefono = valor
        else:
            db.add(ClienteTelefono(
                cliente_id=cliente.id_cliente,
                telefono=valor,
                tipo=tipo,
            ))

    if datos.telefono is not None:
        guardar_telefono("telefono", datos.telefono)
    if datos.whatsapp is not None:
        guardar_telefono("whatsapp", datos.whatsapp)
    cliente.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/password", status_code=200)
def cambiar_password(
    datos: CambioPasswordIn,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import bcrypt
    from models.cliente import PortalAcceso

    acceso = db.query(PortalAcceso).filter(
        PortalAcceso.cliente_id == cliente.id_cliente,
        PortalAcceso.portal_acceso_activo == True,
    ).first()
    if not acceso or not acceso.password_hash:
        raise HTTPException(status_code=400, detail="La cuenta no tiene contraseña configurada")

    if not bcrypt.checkpw(datos.password_actual.encode(), acceso.password_hash.encode()):
        raise HTTPException(status_code=400, detail="La contraseña actual no es correcta")

    acceso.password_hash = bcrypt.hashpw(datos.password_nueva.encode(), bcrypt.gensalt()).decode()
    acceso.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}


@router.get("/mis-cotizaciones", response_model=list[CotizacionPortalOut])
def mis_cotizaciones(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Cotizacion)
        .filter(Cotizacion.cliente_id == cliente.id_cliente)
        .order_by(Cotizacion.fecha_solicitud.desc())
        .all()
    )


@router.get("/mis-polizas", response_model=list[PolizaPortalOut])
def mis_polizas(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Poliza)
        .filter(Poliza.cliente_id == cliente.id_cliente)
        .order_by(Poliza.fecha_inicio.desc())
        .all()
    )


@router.get("/mis-polizas/{id_poliza}", response_model=PolizaDetalleOut)
def detalle_poliza(
    id_poliza: int,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poliza = db.query(Poliza).filter(
        Poliza.id_poliza == id_poliza,
        Poliza.cliente_id == cliente.id_cliente,
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return poliza


@router.get("/mis-polizas/{id_poliza}/pagos", response_model=list[PagoPortalOut])
def pagos_poliza(
    id_poliza: int,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poliza = db.query(Poliza).filter(
        Poliza.id_poliza == id_poliza,
        Poliza.cliente_id == cliente.id_cliente,
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return db.query(PolizaPago).filter(PolizaPago.poliza_id == id_poliza).order_by(PolizaPago.numero_cuota).all()


@router.get("/mis-pagos", response_model=list[PagoAgregadoOut])
def mis_pagos(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    polizas = db.query(Poliza).filter(Poliza.cliente_id == cliente.id_cliente).all()
    resultado = []
    for poliza in polizas:
        for pago in poliza.pagos:
            resultado.append({
                "id_pago": pago.id_pago,
                "numero_cuota": pago.numero_cuota,
                "monto": pago.monto,
                "fecha_vencimiento": pago.fecha_vencimiento,
                "fecha_pago": pago.fecha_pago,
                "estado": pago.estado,
                "poliza_id": poliza.id_poliza,
                "numero_poliza": poliza.numero_poliza,
                "seguro_nombre": poliza.seguro.nombre if poliza.seguro else None,
            })
    return resultado


@router.get("/mis-coberturas", response_model=list[CoberturaPortalOut])
def mis_coberturas(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    polizas = db.query(Poliza).filter(Poliza.cliente_id == cliente.id_cliente).all()
    return [
        {
            "id_poliza": p.id_poliza,
            "seguro": p.seguro,
            "compania": p.compania,
            "numero_poliza": p.numero_poliza,
            "coberturas": [],
        }
        for p in polizas
    ]


@router.get("/mis-beneficiarios", response_model=list[BeneficiarioAgregadoOut])
def mis_beneficiarios(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    polizas = db.query(Poliza).filter(Poliza.cliente_id == cliente.id_cliente).all()
    resultado = []
    for poliza in polizas:
        for b in poliza.beneficiarios:
            resultado.append({
                "id_beneficiario": b.id_beneficiario,
                "poliza_id": poliza.id_poliza,
                "numero_poliza": poliza.numero_poliza,
                "nombre": b.nombre,
                "rut": b.rut,
                "relacion": b.relacion,
            })
    return resultado


@router.post("/perfil/foto", response_model=ClientePerfilOut)
async def subir_foto_perfil(
    crop: str = Form(...),
    foto: UploadFile | None = File(None),
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Guarda la foto de perfil con recorte ajustable.

    - `foto`: imagen nueva (opcional). Si viene, se guarda la ORIGINAL (sin
      recortar, máx 1400px) para poder re-encuadrar después.
    - `crop`: encuadre normalizado {x,y,w,h} (fracciones 0..1 de la original).
      El avatar cuadrado (400px) se recorta EN EL SERVIDOR según ese encuadre.

    Al re-ajustar una foto ya subida, el front manda solo `crop` (sin `foto`) y
    el recorte se hace sobre la original guardada.
    """
    from io import BytesIO
    from PIL import Image, UnidentifiedImageError

    # Encuadre normalizado {x,y,w,h} en fracciones 0..1 de la imagen original.
    try:
        c = json.loads(crop)
        rx = min(max(float(c["x"]), 0.0), 1.0)
        ry = min(max(float(c["y"]), 0.0), 1.0)
        rw = min(max(float(c["w"]), 0.0), 1.0)
        rh = min(max(float(c["h"]), 0.0), 1.0)
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=400, detail="Encuadre inválido")

    # 1) Obtener la imagen ORIGINAL (recién subida, o la ya guardada).
    if foto is not None:
        ext = Path(foto.filename or "").suffix.lower()
        if ext not in EXTENSIONES_IMAGEN:
            raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG, PNG o WEBP")
        contenido = await foto.read()
        if len(contenido) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="La imagen no puede superar 8MB")
        try:
            original = Image.open(BytesIO(contenido)).convert("RGBA")
        except (UnidentifiedImageError, OSError):
            raise HTTPException(status_code=400, detail="No se pudo procesar la imagen")

        # Guardar la original downsizeada (máx 1400px) para re-encuadrar luego.
        base_img = original.copy()
        base_img.thumbnail((1400, 1400))
        buf_o = BytesIO()
        base_img.save(buf_o, format="WEBP", quality=82, method=6)
        nombre_orig = f"{uuid.uuid4()}_orig.webp"
        (UPLOADS_DIR / "fotos" / nombre_orig).write_bytes(buf_o.getvalue())
        if cliente.foto_original:
            ant = UPLOADS_DIR / "fotos" / Path(cliente.foto_original).name
            if ant.exists():
                ant.unlink()
        cliente.foto_original = f"/uploads/fotos/{nombre_orig}"
    else:
        # Re-encuadre: usar la original ya guardada.
        if not cliente.foto_original:
            raise HTTPException(status_code=400, detail="No hay foto original para ajustar")
        ruta_orig = UPLOADS_DIR / "fotos" / Path(cliente.foto_original).name
        if not ruta_orig.exists():
            raise HTTPException(status_code=400, detail="La foto original no está disponible")
        try:
            base_img = Image.open(ruta_orig).convert("RGBA")
        except (UnidentifiedImageError, OSError):
            raise HTTPException(status_code=400, detail="No se pudo procesar la foto original")

    # 2) Recortar el cuadrado según el encuadre → avatar 400px WebP.
    W, H = base_img.size
    side = int(round(min(rw * W, rh * H)))
    side = max(1, min(side, W, H))
    left = max(0, min(int(round(rx * W)), W - side))
    top = max(0, min(int(round(ry * H)), H - side))
    recorte = base_img.crop((left, top, left + side, top + side)).resize((400, 400))
    buf = BytesIO()
    recorte.save(buf, format="WEBP", quality=80, method=6)

    nombre_archivo = f"{uuid.uuid4()}.webp"
    (UPLOADS_DIR / "fotos" / nombre_archivo).write_bytes(buf.getvalue())
    if cliente.foto_perfil:
        ant = UPLOADS_DIR / "fotos" / Path(cliente.foto_perfil).name
        if ant.exists():
            ant.unlink()
    cliente.foto_perfil = f"/uploads/fotos/{nombre_archivo}"

    cliente.foto_crop = json.dumps({"x": rx, "y": ry, "w": rw, "h": rh})
    cliente.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/perfil/foto", response_model=ClientePerfilOut)
def eliminar_foto_perfil(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Borra tanto el avatar recortado como la original y el encuadre.
    for campo in ("foto_perfil", "foto_original"):
        valor = getattr(cliente, campo)
        if valor:
            ruta = UPLOADS_DIR / "fotos" / Path(valor).name
            if ruta.exists():
                ruta.unlink()
    cliente.foto_perfil = None
    cliente.foto_original = None
    cliente.foto_crop = None
    cliente.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("/mis-siniestros", response_model=list[SiniestroOut])
def mis_siniestros(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    siniestros = (
        db.query(Siniestro)
        .filter(Siniestro.cliente_id == cliente.id_cliente)
        .order_by(Siniestro.fecha_registro.desc())
        .all()
    )
    resultado = []
    for s in siniestros:
        resultado.append({
            "id_siniestro": s.id_siniestro,
            "poliza_id": s.poliza_id,
            "tipo": s.tipo,
            "descripcion": s.descripcion,
            "fecha_ocurrencia": s.fecha_ocurrencia,
            "etapa": s.etapa,
            "estado": s.estado,
            "fecha_registro": s.fecha_registro,
            "numero_poliza": s.poliza.numero_poliza if s.poliza else None,
            "seguro_nombre": s.poliza.seguro.nombre if s.poliza and s.poliza.seguro else None,
        })
    return resultado


@router.post("/mis-siniestros", response_model=SiniestroOut, status_code=201)
def crear_siniestro(
    datos: SiniestroIn,
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poliza = db.query(Poliza).filter(
        Poliza.id_poliza == datos.poliza_id,
        Poliza.cliente_id == cliente.id_cliente,
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")

    siniestro = Siniestro(
        cliente_id=cliente.id_cliente,
        poliza_id=datos.poliza_id,
        tipo=datos.tipo,
        descripcion=datos.descripcion,
        fecha_ocurrencia=datos.fecha_ocurrencia,
        etapa=1,
        estado="reportado",
    )
    db.add(siniestro)
    db.commit()
    db.refresh(siniestro)

    return {
        "id_siniestro": siniestro.id_siniestro,
        "poliza_id": siniestro.poliza_id,
        "tipo": siniestro.tipo,
        "descripcion": siniestro.descripcion,
        "fecha_ocurrencia": siniestro.fecha_ocurrencia,
        "etapa": siniestro.etapa,
        "estado": siniestro.estado,
        "fecha_registro": siniestro.fecha_registro,
        "numero_poliza": poliza.numero_poliza,
        "seguro_nombre": poliza.seguro.nombre if poliza.seguro else None,
    }


@router.get("/mis-documentos", response_model=list[DocumentoClienteOut])
def mis_documentos(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(DocumentoCliente)
        .filter(DocumentoCliente.cliente_id == cliente.id_cliente)
        .order_by(DocumentoCliente.fecha_emision.desc())
        .all()
    )
    resultado = []
    for d in docs:
        resultado.append({
            "id_documento": d.id_documento,
            "poliza_id": d.poliza_id,
            "nombre": d.nombre,
            "tipo": d.tipo,
            "estado": d.estado,
            "url": d.url,
            "fecha_emision": d.fecha_emision,
            "numero_poliza": d.poliza.numero_poliza if d.poliza else None,
            "seguro_nombre": d.poliza.seguro.nombre if d.poliza and d.poliza.seguro else None,
        })
    return resultado


@router.post("/documentos/subir", response_model=DocumentoClienteOut, status_code=201)
async def subir_documento(
    archivo: UploadFile = File(...),
    poliza_id: int = None,
    nombre: str = None,
    tipo: str = "Documento",
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = Path(archivo.filename or "").suffix.lower()
    if ext not in EXTENSIONES_DOCUMENTO:
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF, JPG o PNG")

    contenido = await archivo.read()
    if len(contenido) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="El archivo no puede superar 10MB")

    if poliza_id:
        poliza = db.query(Poliza).filter(
            Poliza.id_poliza == poliza_id,
            Poliza.cliente_id == cliente.id_cliente,
        ).first()
        if not poliza:
            raise HTTPException(status_code=404, detail="Póliza no encontrada")

    nombre_archivo = f"{uuid.uuid4()}{ext}"
    ruta = UPLOADS_DIR / "documentos" / nombre_archivo
    ruta.write_bytes(contenido)

    doc = DocumentoCliente(
        cliente_id=cliente.id_cliente,
        poliza_id=poliza_id,
        nombre=nombre or archivo.filename or "Documento",
        tipo=tipo,
        estado="Disponible",
        url=f"/uploads/documentos/{nombre_archivo}",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id_documento": doc.id_documento,
        "poliza_id": doc.poliza_id,
        "nombre": doc.nombre,
        "tipo": doc.tipo,
        "estado": doc.estado,
        "url": doc.url,
        "fecha_emision": doc.fecha_emision,
        "numero_poliza": doc.poliza.numero_poliza if doc.poliza else None,
        "seguro_nombre": doc.poliza.seguro.nombre if doc.poliza and doc.poliza.seguro else None,
    }


@router.get("/mis-beneficios")
def mis_beneficios(_: Cliente = Depends(get_current_user)):
    return []


@router.get("/mis-alertas", response_model=list[AlertaOut])
def mis_alertas(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    hoy = date.today()
    alertas = []

    polizas = db.query(Poliza).filter(
        Poliza.cliente_id == cliente.id_cliente,
        Poliza.estado == "activa",
    ).all()

    for poliza in polizas:
        nombre_seguro = poliza.seguro.nombre if poliza.seguro else "Póliza"

        if poliza.fecha_vencimiento:
            dias_restantes = (poliza.fecha_vencimiento - hoy).days
            if 0 <= dias_restantes <= 30:
                alertas.append({
                    "id_alerta": f"vencimiento-{poliza.id_poliza}",
                    "tipo": "vencimiento",
                    "titulo": f"Póliza por vencer: {nombre_seguro}",
                    "mensaje": f"Tu póliza vence el {poliza.fecha_vencimiento.strftime('%d/%m/%Y')} ({dias_restantes} días).",
                })

        pagos_proximos = db.query(PolizaPago).filter(
            PolizaPago.poliza_id == poliza.id_poliza,
            PolizaPago.estado == "pendiente",
            PolizaPago.fecha_vencimiento >= hoy,
            PolizaPago.fecha_vencimiento <= hoy + timedelta(days=15),
        ).all()

        for pago in pagos_proximos:
            alertas.append({
                "id_alerta": f"pago-{pago.id_pago}",
                "tipo": "pago",
                "titulo": f"Cuota próxima: {nombre_seguro}",
                "mensaje": f"Cuota {pago.numero_cuota} por ${pago.monto:,.0f} vence el {pago.fecha_vencimiento.strftime('%d/%m/%Y')}.",
            })

    return alertas


@router.get("/metodos-pago", response_model=list[MetodoPagoOut])
def metodos_pago(
    cliente: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(MetodoPago)
        .filter(MetodoPago.cliente_id == cliente.id_cliente, MetodoPago.activo == True)
        .all()
    )


@router.post("/asistencia")
def solicitar_asistencia(_: Cliente = Depends(get_current_user)):
    return {"ok": True}
