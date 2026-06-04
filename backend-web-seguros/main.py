import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import seguros, contacto, cotizaciones, auth, portal, interno

load_dotenv()

app = FastAPI(title="Prieto & Correa Seguros API")

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seguros.router)
app.include_router(contacto.router)
app.include_router(cotizaciones.router)
app.include_router(auth.router)
app.include_router(portal.router)
app.include_router(interno.router)


@app.get("/")
def inicio():
    return {"mensaje": "API Prieto & Correa Seguros"}