from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class SeguroCatalogo(Base):
    __tablename__ = "web_seguros_catalogo"

    id_seguro = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    permite_digital = Column(Boolean, default=False)
    permite_tradicional = Column(Boolean, default=True)
    url_externa = Column(String(500))
    seguro_activo = Column(Boolean, default=True)
    orden_display = Column(Integer, default=0)

    cotizaciones = relationship("Cotizacion", back_populates="seguro")
    polizas = relationship("Poliza", back_populates="seguro")
