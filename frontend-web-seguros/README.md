# Prieto & Correa Seguros — Plataforma Web

Plataforma web para Prieto & Correa Seguros, corredora chilena. Permite a clientes cotizar seguros, acceder a su portal personal y contactar a los asesores.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.14, FastAPI, SQLAlchemy 2.0, Uvicorn |
| Base de datos | MariaDB (PyMySQL) |
| Auth | JWT (HS256), bcrypt 5.0.0 |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |

## Estructura

```
pagina_web_seguros/
├── backend-web-seguros/      # API FastAPI
│   ├── main.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   └── tests/                # Seeds de prueba
├── frontend-web-seguros/     # App React
│   └── src/
│       ├── components/       # Header, Footer, Hero, etc.
│       ├── pages/            # Home, Seguros, Cotizador, Contacto, etc.
│       ├── routes/           # Router.jsx
│       ├── services/         # api.js — todas las llamadas al backend
│       ├── hooks/            # useFetch.js
│       └── data/             # siteData.js — contenido estático sin endpoint
└── entorno_web_seguros/      # Virtualenv Python (no commitear)
```

## Levantar el proyecto

Necesitas dos terminales abiertas al mismo tiempo.

**Terminal 1 — Backend**
```bash
cd backend-web-seguros
../entorno_web_seguros/Scripts/python.exe -m uvicorn main:app --reload
# API disponible en http://localhost:8000
# Docs en http://localhost:8000/docs
```

**Terminal 2 — Frontend**
```bash
cd frontend-web-seguros
npm run dev
# App disponible en http://localhost:5173
```

## Variables de entorno

El backend requiere `backend-web-seguros/.env`:

```env
DATABASE_URL=mysql+pymysql://usuario:password@localhost:3306/seguros_web_db
SECRET_KEY=tu_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
ALLOWED_ORIGINS=http://localhost:5173
```

## Endpoints del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/seguros/` | Catálogo de seguros activos |
| GET | `/seguros/{id}` | Detalle de un seguro |
| POST | `/cotizaciones/` | Crear solicitud de cotización |
| POST | `/contacto/` | Enviar formulario de contacto |
| POST | `/auth/login` | Login del portal cliente (devuelve JWT) |
| GET | `/portal/mis-cotizaciones` | Cotizaciones del cliente autenticado |
| GET | `/portal/mis-polizas` | Pólizas del cliente autenticado |
| GET | `/portal/mis-polizas/{id}` | Detalle de una póliza |

## Páginas del frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Home |
| `/seguros` | Catálogo de seguros (carga desde API) |
| `/cotizador` | Formulario de cotización (POST a API) |
| `/contacto` | Formulario de contacto (POST a API) |
| `/clientes` | Login del portal |
| `/clientes/dashboard` | Portal cliente (requiere JWT) |
| `/nosotros` | Página institucional |

## Integraciones externas

- **RCI Argentina** → cotizador BCI (link externo, sin formulario propio)
- **Asistencia en Viaje** → `viajes.prietocorreaseguros.cl` (link externo)
- **Seguro de Mascotas** → cotizador BCI (link externo)
- **Documentos y pólizas** → Brokerion (sistema externo, pendiente integración)

## Seeds de prueba

```bash
cd backend-web-seguros
../entorno_web_seguros/Scripts/python.exe tests/seed_catalogo.py
../entorno_web_seguros/Scripts/python.exe tests/seed_portal_acceso.py
../entorno_web_seguros/Scripts/python.exe tests/seed_cotizacion.py
../entorno_web_seguros/Scripts/python.exe tests/seed_contacto.py
```

## Pendiente

- Panel de administración para trabajadores (login con roles, gestión de cotizaciones y catálogo)
- Deployment en DigitalOcean
- SOAP: agregar al catálogo cuando haya información del producto
- Subida de archivos (Garantías, Mujer Segura) — pendiente integración con Brokerion
