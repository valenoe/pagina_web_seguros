# Prieto & Correa Seguros — Página Web

Plataforma web para la gestión de seguros: catálogo de productos, cotizaciones en línea y portal de clientes.

---

## Stack

| Capa          | Tecnología                                  |
| ------------- | ------------------------------------------- |
| Backend       | Python 3.14, FastAPI, SQLAlchemy 2, Uvicorn |
| Base de datos | MariaDB                                     |
| Frontend      | React 19, Vite 8, Tailwind CSS 4            |

---

## Prerrequisitos

- Python 3.14+
- MariaDB corriendo en `localhost:3306`
- Node.js (versión LTS recomendada)

---

## Configuración del backend

```bash
# Crear y activar el entorno virtual (desde la raíz del proyecto)
python -m venv entorno_web_seguros
entorno_web_seguros\Scripts\activate   # Windows
# source entorno_web_seguros/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Crear el archivo backend-web-seguros/.env con el contenido de la sección Variables de entorno

# Levantar el servidor de desarrollo
cd backend-web-seguros
uvicorn main:app --reload
```

La API queda disponible en `http://localhost:8000`.  
Documentación automática en `http://localhost:8000/docs`.

---

## Configuración del frontend

```bash
cd frontend-web-seguros
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

### Estructura del frontend

```
frontend-web-seguros/src/
├── components/       # Header, Footer, Hero, WhatsAppButton, etc.
├── pages/            # Home, Seguros, Cotizador, Contacto, Clientes, Dashboard, Nosotros
├── routes/           # Router.jsx con todas las rutas
├── services/         # api.js — todas las llamadas al backend
├── hooks/            # useFetch.js para cargar datos
└── data/             # siteData.js — contenido estático sin endpoint (noticias)
```

### Páginas del frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero, servicios, "Por qué elegirnos", aseguradoras, noticias |
| `/nosotros` | Página institucional con misión, cultura, valores |
| `/seguros` | Catálogo de seguros (carga desde API `/seguros/`) con filtro por categoría |
| `/cotizador` | Formulario de cotización (POST a API `/cotizaciones/`) |
| `/contacto` | Formulario de contacto (POST a API `/contacto/`) |
| `/clientes` | Login del portal con RUT, tipo_cliente, password |
| `/clientes/dashboard` | Portal cliente autenticado (requiere JWT): mis cotizaciones, mis pólizas |

### Integraciones externas (sin formulario propio)

- **RCI Argentina** → cotizador BCI (link externo)
- **Asistencia en Viaje** → `viajes.prietocorreaseguros.cl` (link externo)
- **Seguro de Mascotas** → cotizador BCI (link externo)

## Base de datos

El schema completo está en `DB.sql`. Para inicializar desde cero:

```bash
mysql -u usuario -p seguros_web_db < DB.sql
```

Para cargar datos de prueba:

```bash
cd backend-web-seguros
python -m tests.seed_catalogo       # 3 seguros de prueba
python -m tests.seed_portal_acceso  # 1 cliente con acceso al portal
```

---

## Variables de entorno

Crear el archivo `backend-web-seguros/.env` con las siguientes variables:

| Variable                      | Descripción                                                             | Ejemplo                                                            |
| ----------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`                | Cadena de conexión a MariaDB                                            | `mysql+pymysql://usuario:contraseña@localhost:3306/seguros_web_db` |
| `SECRET_KEY`                  | Clave secreta para firmar los JWT (generar con `secrets.token_hex(32)`) | `2075b8055d372c...`                                                |
| `ALGORITHM`                   | Algoritmo de firma JWT                                                  | `HS256`                                                            |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos                                           | `480`                                                              |
| `ALLOWED_ORIGINS`             | Orígenes permitidos para CORS, separados por coma                       | `http://localhost:5173,https://prietocorrea.cl`                    |

---

## Endpoints disponibles

### Público

| Método | Ruta             | Descripción                             |
| ------ | ---------------- | --------------------------------------- |
| `GET`  | `/seguros/`      | Lista el catálogo de seguros activos    |
| `GET`  | `/seguros/{id}`  | Detalle de un seguro                    |
| `POST` | `/contacto/`     | Envía un formulario de contacto         |
| `POST` | `/cotizaciones/` | Crea una solicitud de cotización        |
| `POST` | `/auth/login`    | Login con RUT y contraseña, retorna JWT |

### Portal del cliente (requiere JWT)

| Método | Ruta                       | Descripción                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| `GET`  | `/portal/mis-cotizaciones` | Lista las cotizaciones del cliente autenticado |
| `GET`  | `/portal/mis-polizas`      | Lista las pólizas del cliente autenticado      |
| `GET`  | `/portal/mis-polizas/{id}` | Detalle de una póliza con sus beneficiarios    |

---

## Scripts de prueba

Ubicados en `backend-web-seguros/tests/`. Ejecutar desde `backend-web-seguros/`.

| Script                  | Descripción                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `test_conexion.py`      | Verifica la conexión a MariaDB con `SHOW TABLES`              |
| `seed_catalogo.py`      | Inserta 3 seguros en `web_seguros_catalogo`                   |
| `seed_contacto.py`      | Inserta 1 lead de prueba en `web_leads_contacto`              |
| `seed_cotizacion.py`    | Inserta 1 cotización de prueba en `web_cotizaciones`          |
| `seed_portal_acceso.py` | Inserta 1 cliente con acceso al portal (imprime credenciales) |

---

## Deployment

> Pendiente. El proyecto será desplegado en una máquina virtual de DigitalOcean.

## Base de datos

https://dbdiagram.io/d/6a1604dcb62396d22c779ea4
