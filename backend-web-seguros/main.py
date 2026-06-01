from fastapi import FastAPI
from routers import seguros, contacto, cotizaciones, auth

app = FastAPI(title="Prieto & Correa Seguros API")

app.include_router(seguros.router)
app.include_router(contacto.router)
app.include_router(cotizaciones.router)
app.include_router(auth.router)


@app.get("/")
def inicio():
    return {"mensaje": "API Prieto & Correa Seguros"}