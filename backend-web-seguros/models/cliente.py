from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class ClienteTelefono(Base):
    __tablename__ = "web_cliente_telefonos"

    id_telefono = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    telefono = Column(String(20), nullable=False)
    tipo = Column(String(10), nullable=False, default="telefono")

    cliente = relationship("Cliente", back_populates="telefonos")


class ClienteEmail(Base):
    __tablename__ = "web_cliente_emails"

    id_email = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    email = Column(String(100), nullable=False)

    cliente = relationship("Cliente", back_populates="emails")


class Cliente(Base):
    __tablename__ = "web_clientes"

    id_cliente = Column(Integer, primary_key=True, autoincrement=True)
    rut = Column(String(20), nullable=False)
    tipo_cliente = Column(String(10), nullable=False)
    nombre_o_razon_social = Column(String(200), nullable=False)
    fecha_nacimiento = Column(Date)
    direccion = Column(String(300))
    region = Column(String(100))
    comuna = Column(String(100))
    foto_perfil = Column(String(500))
    cliente_activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime)

    cotizaciones = relationship("Cotizacion", back_populates="cliente")
    polizas = relationship("Poliza", back_populates="cliente")
    acceso_portal = relationship("PortalAcceso", back_populates="cliente", uselist=False)
    telefonos = relationship("ClienteTelefono", back_populates="cliente", cascade="all, delete-orphan")
    emails = relationship("ClienteEmail", back_populates="cliente", cascade="all, delete-orphan")


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
