from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from database import Base


class Imagen(Base):
    __tablename__ = "web_imagenes"

    id_imagen = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    descripcion = Column(String(500))
    seccion = Column(String(100))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
