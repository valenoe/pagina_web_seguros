from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.contacto import LeadContacto
from schemas.contacto import ContactoIn, ContactoOut

router = APIRouter(prefix="/contacto", tags=["Contacto"])

# Endpoint para crear un nuevo contacto (lead)

# El frontend envía un JSON con los datos del contacto, 
# el backend lo guarda en la base de datos 
# y devuelve el contacto creado con su ID y fecha de registro.
@router.post("/", response_model=ContactoOut, status_code=201)
def crear_contacto(datos: ContactoIn, db: Session = Depends(get_db)):
    lead = LeadContacto(**datos.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
