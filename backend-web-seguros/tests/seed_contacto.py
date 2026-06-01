from database import SessionLocal
from models.contacto import LeadContacto

LEAD = {
    "nombre": "Catalina Fuentes Riquelme",
    "email": "catalina.fuentes@gmail.com",
    "telefono": "+56 9 8234 5671",
    "mensaje": "Hola, me interesa cotizar un seguro de accidentes personales para mí y mi pareja. ¿Pueden contactarme esta semana?",
}


def seed():
    db = SessionLocal()
    try:
        lead = LeadContacto(**LEAD)
        db.add(lead)
        db.commit()
        db.refresh(lead)
        print(f"Lead insertado: [{lead.id_lead}] {lead.nombre} — {lead.email}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
