import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from database import get_db
from models.cliente import Cliente

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Cliente:
    credenciales_invalidas = HTTPException(status_code=401, detail="Token inválido o expirado")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        cliente_id: str = payload.get("sub")
        if cliente_id is None:
            raise credenciales_invalidas
    except JWTError:
        raise credenciales_invalidas

    cliente = db.query(Cliente).filter(
        Cliente.id_cliente == int(cliente_id),
        Cliente.cliente_activo == True,
    ).first()
    if not cliente:
        raise credenciales_invalidas

    return cliente
