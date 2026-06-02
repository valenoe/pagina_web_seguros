import bcrypt
from database import SessionLocal
from models.cliente import Cliente, PortalAcceso

CLIENTE = {
    "rut": "12.456.789-3",
    "tipo_cliente": "persona",
    "nombre_o_razon_social": "Valentina Andrea Muñoz Cisternas",
    "email": "valentina.munoz@gmail.com",
    "telefono": "+56 9 6123 4987",
    "cliente_activo": True,
}

PASSWORD_PRUEBA = "Seguros2024!"


def seed():
    db = SessionLocal()
    try:
        existente = db.query(Cliente).filter(Cliente.rut == CLIENTE["rut"]).first()
        if existente:
            print(f"El cliente con RUT {CLIENTE['rut']} ya existe (id_cliente={existente.id_cliente}). No se insertó nada.")
            return

        cliente = Cliente(**CLIENTE)
        db.add(cliente)
        db.flush()

        acceso = PortalAcceso(
            cliente_id=cliente.id_cliente,
            tipo_acceso="password",
            pin_hash=bcrypt.hashpw("000000".encode(), bcrypt.gensalt()).decode(),
            password_hash=bcrypt.hashpw(PASSWORD_PRUEBA.encode(), bcrypt.gensalt()).decode(),
            tiene_cuenta=True,
            portal_acceso_activo=True,
        )
        db.add(acceso)
        db.commit()

        print(f"Cliente insertado:  [{cliente.id_cliente}] {cliente.nombre_o_razon_social} — {cliente.rut}")
        print(f"Acceso creado:      id_acceso={acceso.id_acceso} | tipo_acceso=password")
        print(f"Credenciales:       rut={cliente.rut} | tipo_cliente=persona | password={PASSWORD_PRUEBA}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
