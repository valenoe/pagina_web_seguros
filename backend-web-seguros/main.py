from fastapi import FastAPI
from routers import seguros, contacto

app = FastAPI(title="Prieto & Correa Seguros API")

app.include_router(seguros.router)
app.include_router(contacto.router)


@app.get("/")
def inicio():
    return {"mensaje": "API Prieto & Correa Seguros"}