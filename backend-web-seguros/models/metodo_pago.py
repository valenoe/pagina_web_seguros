from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class MetodoPago(Base):
    __tablename__ = "web_metodos_pago"

    id_metodo = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    tipo = Column(String(50), nullable=False)
    descripcion = Column(String(200))
    ultimo4 = Column(String(4))
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())

    cliente = relationship("Cliente")
