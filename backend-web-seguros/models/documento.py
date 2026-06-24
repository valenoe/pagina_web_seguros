from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class DocumentoCliente(Base):
    __tablename__ = "web_documentos_cliente"

    id_documento = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    poliza_id = Column(Integer, ForeignKey("web_polizas.id_poliza"))
    nombre = Column(String(200), nullable=False)
    tipo = Column(String(50), nullable=False, default="Documento")
    estado = Column(String(20), nullable=False, default="Disponible")
    url = Column(String(500))
    fecha_emision = Column(DateTime, server_default=func.now())

    cliente = relationship("Cliente")
    poliza = relationship("Poliza")
