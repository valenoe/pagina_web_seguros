# Prieto & Correa Seguros — Plataforma Web

Plataforma completa para la corredora de seguros Prieto & Correa. Incluye catálogo de productos, cotizaciones en línea, portal de clientes y panel de administración interno.

---

## Arquitectura

```
pagina_web_seguros/
├── backend-web-seguros/    FastAPI · Python 3.14 · SQLAlchemy 2 · MariaDB
├── frontend-web-seguros/   React 19 · Vite  (sitio público + portal cliente)
├── admin-web-seguros/      React 19 · Vite · Tailwind CSS  (panel interno)
└── DB.sql                  Schema completo de la base de datos
```

```
frontend (5173) ──┐
admin     (5174) ──┤──► backend (8000) ──► MariaDB (3306)
```

---

## Prerrequisitos

- Python 3.12 o superior
- Node.js 18 LTS o superior
- MariaDB 10.6 o superior corriendo en `localhost:3306`

---

## Configuración inicial

### 1. Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE seguros_web_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p seguros_web_db < DB.sql
```

El archivo `DB.sql` incluye el schema completo y los seguros del catálogo precargados.

### 2. Backend

```bash
# Crear y activar entorno virtual (desde la raíz del proyecto)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Instalar todas las dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cd backend-web-seguros
copy .env.example .env
# editar .env con los datos reales

uvicorn main:app --reload
```

API disponible en `http://localhost:8000` — documentación en `http://localhost:8000/docs`.

### 3. Frontend (portal público y de clientes)

```bash
cd frontend-web-seguros
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

### 4. Panel de administración

```bash
cd admin-web-seguros
npm install
npm run dev
```

Disponible en `http://localhost:5174`.

---

## Variables de entorno — Backend

Archivo: `backend-web-seguros/.env` (basado en `.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión MariaDB | `mysql+pymysql://root:pass@localhost:3306/seguros_web_db` |
| `ALLOWED_ORIGINS` | Orígenes CORS separados por coma | `http://localhost:5173,http://localhost:5174` |
| `SECRET_KEY` | Clave para firmar JWT — generar con `secrets.token_hex(32)` | `2075b8055d372c...` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos | `480` |
| `LINK_SISTEMA_EXTERNO` | URL del sistema externo de pólizas | `https://...` |

---

## Endpoints disponibles

### Público (sin autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/seguros/` | Catálogo de seguros activos |
| `GET` | `/seguros/{id}` | Detalle de un seguro |
| `POST` | `/cotizaciones/` | Solicitar cotización |
| `POST` | `/contacto/` | Formulario de contacto |
| `POST` | `/auth/registro` | Registro de cliente (crea cuenta nueva o reactiva una desactivada con el mismo RUT) |
| `POST` | `/auth/login` | Login cliente — retorna JWT |
| `POST` | `/auth/admin/login` | Login usuario interno — retorna JWT |

### Portal cliente (JWT requerido — header `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/portal/perfil` | Datos personales, teléfonos y emails del cliente |
| `GET` | `/portal/mis-cotizaciones` | Cotizaciones del cliente autenticado |
| `GET` | `/portal/mis-polizas` | Pólizas del cliente autenticado |
| `GET` | `/portal/mis-polizas/{id}` | Detalle de póliza con beneficiarios y pagos |

### Panel admin (JWT interno requerido)

| Método | Ruta | Roles |
|---|---|---|
| `GET` | `/admin/leads` | admin, agente |
| `GET` | `/admin/cotizaciones` | admin, agente |
| `GET/POST/PUT/DELETE` | `/admin/clientes` | admin |
| `GET/POST/PUT/DELETE` | `/admin/polizas` | admin |
| `GET/POST/PUT/DELETE` | `/admin/polizas/{id}/pagos` | admin |
| `GET/POST/PUT/DELETE` | `/admin/seguros` | admin |
| `GET/POST/PUT/DELETE` | `/admin/imagenes` | admin |
| `GET/POST/PUT/DELETE` | `/admin/usuarios` | admin |

---

## Páginas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Home — hero, servicios, aseguradoras, noticias |
| `/nosotros` | Página institucional |
| `/seguros` | Catálogo con filtro por categoría |
| `/cotizador` | Formulario de cotización |
| `/contacto` | Formulario de contacto |
| `/login-clientes` | Login portal cliente |
| `/registro-clientes` | Registro de cliente nuevo |
| `/clientes/dashboard` | Portal cliente autenticado |
| `/clientes/seguro/:id` | Detalle de seguro desde el portal |

---

## Frontend — organización y convenciones

### Estilos (CSS)

- Un archivo de estilos **por página/componente** en `frontend-web-seguros/src/styles/` (`pages/` y `components/`), más `global.css` con el reset, las variables de color (`--pc-blue`, `--pc-orange`, …) y la tipografía. No hay un `App.css` monolítico.

### Responsividad

- **`clamp()`** para todo lo que escala de forma continua: tamaños de fuente, paddings y gaps. Evita acumular breakpoints solo para achicar valores (p. ej. `font-size: clamp(30px, 5vw, 50px)`).
- **`@media`** solo para cambios de *layout* (columnas que colapsan, `flex-direction`, ocultar/mostrar). Breakpoints objetivo: `≤1000px` (tablet) y `≤700px` (móvil).
- **`grid-template-columns: repeat(auto-fit, minmax(Npx, 1fr))`** para grillas que se reacomodan solas, sin un breakpoint fijo.
- En grids de 2 columnas con inputs, `minmax(0, …)` + `min-width: 0` para evitar desbordes por el ancho mínimo de los campos.

### Datos compartidos

- `src/data/regionesComunas.js`: lista estática de **regiones y comunas de Chile** (16 regiones). La consumen el **Cotizador** y el **Registro** (selects dependientes región → comuna). Editar ese archivo actualiza ambos formularios.

### Formularios

- Validación en **cliente** por campo (mensaje de error bajo cada input) y en **backend** con Pydantic (`max_length`, formato de email, etc.).
- `PhoneInput` (`src/components/`): selector de código de país + número, con opción **"Otro…"** para códigos que no estén en la lista.

---

## Base de datos — Tablas principales

| Tabla | Descripción |
|---|---|
| `web_clientes` | Clientes registrados |
| `web_cliente_telefonos` | Teléfonos del cliente (tipo: `telefono` / `whatsapp`) |
| `web_cliente_emails` | Emails adicionales del cliente |
| `web_portal_accesos` | Credenciales del portal (password_hash) |
| `web_usuarios_internos` | Usuarios del panel admin (roles: `admin` / `agente`) |
| `web_seguros_catalogo` | Productos de seguros |
| `web_cotizaciones` | Solicitudes de cotización |
| `web_polizas` | Pólizas contratadas |
| `web_poliza_pagos` | Cuotas y pagos de pólizas |
| `web_poliza_beneficiarios` | Beneficiarios por póliza |
| `web_leads_contacto` | Formularios de contacto del sitio |
| `web_imagenes` | Imágenes gestionadas desde el admin |

Diagrama: https://dbdiagram.io/d/6a1604dcb62396d22c779ea4

---

## Autenticación

### Portal cliente

- Login con **RUT + tipo de cliente + contraseña**
- JWT guardado en `localStorage["token"]`
- Si un cliente es **desactivado** por el admin, puede volver a registrarse con el mismo RUT — se reactivan sus datos sin borrar el historial de pólizas y cotizaciones

### Panel admin

- Login con **username o email + contraseña**
- JWT guardado en `localStorage["admin_token"]`
- Rol `admin`: acceso total (CRUD completo)
- Rol `agente`: solo lectura en leads, cotizaciones, clientes y pólizas

---

## Scripts de prueba

Ejecutar desde `backend-web-seguros/` con el entorno virtual activo:

| Script | Descripción |
|---|---|
| `python -m tests.test_conexion` | Verifica la conexión a MariaDB |
| `python -m tests.seed_catalogo` | Inserta seguros de prueba en el catálogo |
| `python -m tests.seed_contacto` | Inserta un lead de contacto de prueba |
| `python -m tests.seed_cotizacion` | Inserta una cotización de prueba |
| `python -m tests.seed_portal_acceso` | Crea un cliente con acceso al portal e imprime las credenciales |
| `python -m tests.seed_usuario_interno` | Crea un usuario admin interno |

---

## Deployment

> Pendiente. El proyecto será desplegado en DigitalOcean.
