from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Cotizacion(Base):
    __tablename__ = "web_cotizaciones"

    id_cotizacion = Column(Integer, primary_key=True, autoincrement=True)
    seguro_id = Column(Integer, ForeignKey("web_seguros_catalogo.id_seguro"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"))
    nombre = Column(String(100), nullable=False)
    rut = Column(String(20), nullable=False)
    tipo_cliente = Column(String(20), nullable=False, default="persona")
    email = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=False)
    mensaje = Column(Text)
    datos_adicionales = Column(Text)
    canal = Column(String(20), nullable=False)
    estado = Column(String(20), default="pendiente")
    fecha_solicitud = Column(DateTime, server_default=func.now())

    seguro = relationship("SeguroCatalogo", back_populates="cotizaciones")
    cliente = relationship("Cliente", back_populates="cotizaciones")
    poliza = relationship("Poliza", back_populates="cotizacion", uselist=False)
