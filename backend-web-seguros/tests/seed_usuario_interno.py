import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import bcrypt
from database import SessionLocal
from models.usuario_interno import UsuarioInterno

USUARIO = {
    "nombre": "Administrador Prieto & Correa",
    "email": "admin@prietocorrea.cl",
    "rol": "admin",
    "activo": True,
}

PASSWORD_PRUEBA = "Interno2024!"


def seed():
    db = SessionLocal()
    try:
        existente = db.query(UsuarioInterno).filter(UsuarioInterno.email == USUARIO["email"]).first()
        if existente:
            print(f"El usuario {USUARIO['email']} ya existe (id_usuario={existente.id_usuario}). No se insertó nada.")
            return

        password_hash = bcrypt.hashpw(PASSWORD_PRUEBA.encode(), bcrypt.gensalt()).decode()
        usuario = UsuarioInterno(**USUARIO, password_hash=password_hash)
        db.add(usuario)
        db.commit()

        print(f"Usuario creado:   [{usuario.id_usuario}] {usuario.nombre} — {usuario.email}")
        print(f"Rol:              {usuario.rol}")
        print(f"Credenciales:     email={usuario.email} | password={PASSWORD_PRUEBA}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
