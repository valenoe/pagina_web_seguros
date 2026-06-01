from fastapi import FastAPI
from routers import seguros

app = FastAPI(title="Prieto & Correa Seguros API")

app.include_router(seguros.router)


@app.get("/")
def inicio():
    return {"mensaje": "API Prieto & Correa Seguros"}