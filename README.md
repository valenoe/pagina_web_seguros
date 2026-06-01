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
# Crear el archivo backend-web-seguros/.env con:
DATABASE_URL=mysql+pymysql://usuario:contraseña@localhost:3306/seguros_web_db

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

---

## Base de datos

El schema completo está en `DB.sql`. Para crearlo desde cero:

```bash
mysql -u usuario -p seguros_web_db < DB.sql
```

---

## Variables de entorno

| Variable       | Descripción                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Cadena de conexión a MariaDB. Formato: `mysql+pymysql://usuario:contraseña@host:puerto/nombre_db` |

---

## Deployment

> Pendiente. El proyecto será desplegado en una máquina virtual de DigitalOcean.

---

## Estado 01-06-2026

Prueba de base de datos
