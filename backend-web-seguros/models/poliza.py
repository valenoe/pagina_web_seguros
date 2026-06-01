from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from database import Base


class Poliza(Base):
    __tablename__ = "web_polizas"

    id_poliza = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("web_clientes.id_cliente"), nullable=False)
    seguro_id = Column(Integer, ForeignKey("web_seguros_catalogo.id_seguro"), nullable=False)
    cotizacion_id = Column(Integer, ForeignKey("web_cotizaciones.id_cotizacion"))
    numero_poliza = Column(String(100))
    compania = Column(String(100))
    fecha_inicio = Column(Date)
    fecha_vencimiento = Column(Date)
    prima = Column(Numeric(12, 2))
    estado = Column(String(20), default="activa")
    origen = Column(String(20), nullable=False)

    cliente = relationship("Cliente", back_populates="polizas")
    seguro = relationship("SeguroCatalogo", back_populates="polizas")
    cotizacion = relationship("Cotizacion", back_populates="poliza")
    beneficiarios = relationship("Beneficiario", back_populates="poliza")


class Beneficiario(Base):
    __tablename__ = "web_poliza_beneficiarios"

    id_beneficiario = Column(Integer, primary_key=True, autoincrement=True)
    poliza_id = Column(Integer, ForeignKey("web_polizas.id_poliza"), nullable=False)
    nombre = Column(String(100), nullable=False)
    rut = Column(String(20))
    relacion = Column(String(50))

    poliza = relationship("Poliza", back_populates="beneficiarios")
