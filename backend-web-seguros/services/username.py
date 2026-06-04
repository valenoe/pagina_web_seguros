import re
import unicodedata
from datetime import datetime
from sqlalchemy.orm import Session


def generar_username(nombre: str, db: Session, modelo) -> str:
    normalizado = unicodedata.normalize("NFD", nombre)
    ascii_str = normalizado.encode("ascii", "ignore").decode("ascii").lower()
    partes = re.sub(r"[^a-z\s]", "", ascii_str).split()

    año = datetime.now().year
    if len(partes) >= 2:
        base = partes[0][0] + partes[1]
    elif len(partes) == 1:
        base = partes[0]
    else:
        base = "user"

    candidato = f"{base}{año}"
    if not db.query(modelo).filter(modelo.username == candidato).first():
        return candidato

    i = 2
    while True:
        candidato = f"{base}{año}{i}"
        if not db.query(modelo).filter(modelo.username == candidato).first():
            return candidato
        i += 1
