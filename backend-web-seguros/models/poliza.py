from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Poliza(Base):
    __tablename__ = "web_polizas"

    id_poliza = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    seguro_id = Column(Integer, ForeignKey("web_seguros_catalogo.id_seguro"), nullable=False)
    cotizacion_id = Column(Integer, ForeignKey("web_cotizaciones.id_cotizacion"))
    numero_poliza = Column(String(100))
    compania = Column(String(100))
    ramo = Column(String(50))            # tipo del broker: hogar, auto, ...
    materia = Column(String(300))        # descripción de la materia asegurada
    producto = Column(String(100))
    fecha_inicio = Column(Date)
    fecha_vencimiento = Column(Date)
    # Desglose de prima (todo en UF; nullable porque el lector de PDF/broker puede
    # no traer todos). `prima` = prima total (bruta y total se asumen iguales).
    prima = Column(Numeric(12, 2))
    prima_neta = Column(Numeric(12, 2))
    prima_afecta = Column(Numeric(12, 2))
    prima_exenta = Column(Numeric(12, 2))
    iva = Column(Numeric(12, 2))
    monto_asegurado = Column(Numeric(14, 2))
    estado = Column(String(20), default="activa")
    origen = Column(String(20), nullable=False)
    forma_pago = Column(String(50))
    frecuencia_pago = Column(String(20))
    num_cuotas = Column(Integer)
    monto_cuota = Column(Numeric(12, 2))
    fecha_proximo_pago = Column(Date)
    # Detalles variables según el ramo (hogar: construcción/dirección/montos;
    # auto: patente/marca/modelo...). JSON para tolerar la variedad.
    materia_asegurada = Column(Text)

    cliente = relationship("Cliente", back_populates="polizas")
    seguro = relationship("SeguroCatalogo", back_populates="polizas")
    cotizacion = relationship("Cotizacion", back_populates="poliza")
    beneficiarios = relationship("Beneficiario", back_populates="poliza")
    pagos = relationship("PolizaPago", back_populates="poliza", order_by="PolizaPago.numero_cuota")
    documentos = relationship(
        "DocumentoCliente",
        foreign_keys="DocumentoCliente.poliza_id",
        viewonly=True,
        overlaps="poliza",
    )


class Beneficiario(Base):
    __tablename__ = "web_poliza_beneficiarios"

    id_beneficiario = Column(Integer, primary_key=True, autoincrement=True)
    poliza_id = Column(Integer, ForeignKey("web_polizas.id_poliza"), nullable=False)
    nombre = Column(String(100), nullable=False)
    rut = Column(String(20))
    relacion = Column(String(50))

    poliza = relationship("Poliza", back_populates="beneficiarios")


class PolizaPago(Base):
    __tablename__ = "web_poliza_pagos"

    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    poliza_id = Column(Integer, ForeignKey("web_polizas.id_poliza"), nullable=False)
    numero_cuota = Column(Integer, nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    fecha_pago = Column(Date)
    estado = Column(String(20), nullable=False, default="pendiente")
    metodo_pago = Column(String(50))
    referencia_transaccion = Column(String(100))
    fecha_registro = Column(DateTime, server_default=func.now())

    poliza = relationship("Poliza", back_populates="pagos")
