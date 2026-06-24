from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Siniestro(Base):
    __tablename__ = "web_siniestros"

    id_siniestro = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    poliza_id = Column(Integer, ForeignKey("web_polizas.id_poliza"), nullable=False)
    tipo = Column(String(100), nullable=False)
    descripcion = Column(Text)
    fecha_ocurrencia = Column(Date)
    etapa = Column(Integer, nullable=False, default=1)
    estado = Column(String(20), nullable=False, default="reportado")
    fecha_registro = Column(DateTime, server_default=func.now())

    cliente = relationship("Cliente")
    poliza = relationship("Poliza")
