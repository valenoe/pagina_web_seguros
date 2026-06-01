from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func
from database import Base


class LeadContacto(Base):
    __tablename__ = "web_leads_contacto"

    id_lead = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    telefono = Column(String(20))
    mensaje = Column(Text)
    fecha_contacto = Column(DateTime, server_default=func.now())
