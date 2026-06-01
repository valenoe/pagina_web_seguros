from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Cliente(Base):
    __tablename__ = "web_clientes"

    id_cliente = Column(Integer, primary_key=True, autoincrement=True)
    rut = Column(String(20), nullable=False)
    tipo_cliente = Column(String(10), nullable=False)
    nombre_o_razon_social = Column(String(200), nullable=False)
    email = Column(String(100))
    telefono = Column(String(20))
    cliente_activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime)

    cotizaciones = relationship("Cotizacion", back_populates="cliente")
    polizas = relationship("Poliza", back_populates="cliente")
    acceso_portal = relationship("PortalAcceso", back_populates="cliente", uselist=False)


class PortalAcceso(Base):
    __tablename__ = "web_portal_accesos"

    id_acceso = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    tipo_acceso = Column(String(10), nullable=False)
    pin_hash = Column(String(255), nullable=False)
    password_hash = Column(String(255))
    tiene_cuenta = Column(Boolean, default=False)
    portal_acceso_activo = Column(Boolean, default=True)
    ultimo_ingreso = Column(DateTime)
    fecha_creacion = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime)

    cliente = relationship("Cliente", back_populates="acceso_portal")
