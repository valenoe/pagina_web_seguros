# Contexto del Proyecto — Prieto & Correa Seguros

## 1. Descripción general

Plataforma web para **Prieto & Correa Seguros**, corredora de seguros chilena. Permite a clientes cotizar seguros, ver su historial de cotizaciones y pólizas, y contactar a los agentes. Los trabajadores de la corredora gestionan las solicitudes manualmente (panel de administración pendiente).

**Flujo principal:**
1. El cliente visita el catálogo de seguros
2. Si el seguro tiene link externo → se redirige a la plataforma de la compañía (digital)
3. Si no → llena un formulario de cotización (tradicional) que llega a los agentes
4. Los agentes procesan la cotización y registran la póliza manualmente
5. El cliente puede ver sus cotizaciones y pólizas desde el portal con JWT

**Integraciones externas activas:**
- **RCI Argentina** → link BCI: cotización de responsabilidad civil para cruzar a Argentina
- **Asistencia en Viaje** → ya implementado por otro equipo en `viajes.prietocorreaseguros.cl` (Mawdy)
- **Seguro de Mascotas** → link cotizador BCI

**Almacenamiento de documentos (pólizas, contratos):** manejado por Brokerion, sistema externo desarrollado por otro equipo. No es responsabilidad de este sistema.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.14, FastAPI, SQLAlchemy 2.0, Uvicorn |
| Base de datos | MariaDB (PyMySQL) |
| Auth | JWT con python-jose (HS256), bcrypt 5.0.0 directo (sin passlib) |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Deployment | DigitalOcean Droplet (pendiente) |

---

## 3. Estado actual

### Listo
- Todos los modelos SQLAlchemy: `cliente`, `catalogo`, `contacto`, `cotizacion`, `poliza`
- Routers: `GET/POST /seguros/`, `POST /contacto/`, `POST /cotizaciones/`, `POST /auth/login`
- Portal del cliente (requiere JWT): `GET /portal/mis-cotizaciones`, `GET /portal/mis-polizas`, `GET /portal/mis-polizas/{id}`
- CORS configurado vía `.env` (`ALLOWED_ORIGINS`)
- Dependency `get_current_user()` en `dependencies.py`
- Seeds de prueba: catálogo (8 seguros reales), portal acceso, contacto, cotización
- `.gitignore` cubre `.env`, `entorno_web_seguros/`, `node_modules/`, `__pycache__/`

### Pendiente
- `campos_formulario` en catálogo: columna JSON que define qué campos tiene cada seguro (ver sección 6)
- Panel de administración para trabajadores (semana siguiente): login con roles, ver/gestionar cotizaciones, gestionar catálogo
- Frontend: tu compañero aún no ha subido trabajo real (solo scaffold de Vite)
- Deployment en DigitalOcean (sin credenciales aún)
- Archivos `.env.example` para backend y frontend
- SOAP: seguro obligatorio chileno, sin información todavía
- Subida de archivos (Garantías: contrato + carpeta tributaria; Mujer Segura: comprobante de transferencia) — diferido a integración con Brokerion

---

## 4. Decisiones de arquitectura

| Decisión | Justificación |
|----------|--------------|
| `bcrypt` directo, sin `passlib` | `passlib 1.7.4` es incompatible con `bcrypt 4+` (busca `bcrypt.__about__.__version__` que no existe) |
| `Base` importada desde `database.py` | Se canceló crear `base.py` separado; todos los modelos hacen `from database import Base` |
| `datos_adicionales` como `longtext` (JSON string) | Cada tipo de seguro tiene campos distintos; se serializa a JSON antes de guardar y se deserializa en el validator de Pydantic |
| `permite_digital=False` para seguros sin link | Solo RCI Argentina, Asistencia en Viaje y Mascotas tienen `url_externa`; el resto es 100% tradicional |
| `permite_tradicional=True` para todos | Cualquier seguro puede solicitarse por formulario aunque también tenga link digital |
| JWT con `sub = id_cliente` | Estándar; `get_current_user()` filtra además por `cliente_activo=True` |
| SOAP separado de RCI Argentina | Son productos distintos: SOAP es el seguro obligatorio chileno (sin info aún); RCI Argentina es responsabilidad civil para cruzar a Argentina |

---

## 5. Tablas de base de datos

```
web_seguros_catalogo    → catálogo de productos (id_seguro, nombre, descripcion, permite_digital,
                          permite_tradicional, url_externa, seguro_activo, orden_display)
                          PENDIENTE: agregar columna campos_formulario (longtext/JSON)

web_leads_contacto      → formulario de contacto general (id_lead, nombre, email, telefono, mensaje)

web_cotizaciones        → solicitudes de cotización (id_cotizacion, seguro_id, cliente_id,
                          nombre, rut, tipo_cliente, email, telefono, mensaje,
                          datos_adicionales longtext, canal, estado, fecha_solicitud)

web_clientes            → clientes registrados (id_cliente, rut, tipo_cliente,
                          nombre_o_razon_social, email, telefono, cliente_activo)

web_portal_accesos      → credenciales del portal (cliente_id, tipo_acceso, pin_hash,
                          password_hash, tiene_cuenta, portal_acceso_activo)

web_polizas             → pólizas vigentes (id_poliza, cliente_id, seguro_id, cotizacion_id,
                          numero_poliza, compania, fecha_inicio, fecha_vencimiento, prima,
                          estado, origen)

web_poliza_beneficiarios → beneficiarios por póliza (poliza_id, nombre, rut, relacion)
```

Schema completo en `DB.sql`. Diagrama en https://dbdiagram.io/d/6a1604dcb62396d22c779ea4

---

## 6. Formularios por tipo de seguro

Los campos base (nombre, rut, email, teléfono) ya están en `web_cotizaciones`. Lo siguiente va en `datos_adicionales`.

### Seguro de Autos
`tipo_auto` (select: Automóvil/Station Wagon/Camioneta/Furgón/Alta Gama/Híbrido), `marca` (select, opciones TBD), `modelo` (texto), `patente` (texto), `anio` (número), `estado_vehiculo` (radio: Nuevo/Usado), `uso` (radio: Particular/Comercial), `tipo_uso` (texto, solo si uso=Comercial), `direccion` (texto), `region` (select), `comuna` (select), `modalidad_pago` (radio: Contado/Plan de pago), `medio_pago` (radio: Tarjeta Crédito/Débito/Cargo Cuenta Corriente)

### Seguro de Hogar
`direccion`, `region`, `comuna`, `ciudad`, `tipo_vivienda` (select: Casa/Departamento), `cantidad_pisos` (número, solo si Casa), `pisos_edificio` (número, solo si Departamento), `piso_departamento` (número, solo si Departamento), `uso` (radio: Habitacional/Vacacional), `tipo_construccion` (select: Sólido Ladrillo/Concreto, Mixto, Ligero), `metros_construidos` (número), `anio_construccion` (número), `monto_edificacion` (número), `monto_contenidos` (número), `cerca_rio` (radio: Sí/No), `cerca_borde_costero` (radio: Sí/No), `deshabitada_30_dias` (radio: Sí/No), `casa_pareada` (radio: Sí/No), `bomberos_mas_10km` (radio: Sí/No), `coberturas_opcionales` (múltiple: Edificación+Contenido/Sismo/Robo), `modalidad_pago`, `medio_pago`

### Seguro de Garantías
`tipo_garantia` (select: Seriedad Oferta/Fiel Cumplimiento/Correcta Inversión Anticipos/Correcta Ejecución Obras), `metodo_liquidacion` (select: A la vista/Ejecución inmediata), `tipo_mandante` (radio: Público/Privado), `razon_social` (texto), `glosa` (texto), `vigencia_inicial` (fecha), `vigencia_final` (fecha), `monto_asegurado_uf` (número), `contrato_proyecto` (archivo — diferido a Brokerion), `carpeta_tributaria` (archivo — diferido a Brokerion)

### Mujer Segura
`fecha_nacimiento` (fecha), `actividad` (texto: descripción del cargo), `direccion`, `region`, `comuna`, `comprobante_transferencia` (archivo — diferido a Brokerion). Dato informativo: transferencia a HDI Seguros S.A — Banco Santander — RUT 99061000-2 — Cta Cte 2547081-8

### Seguro de Accidentes Personales
Sin campos específicos definidos aún. Tratado igual que Mujer Segura (formulario genérico).

### Con link externo (sin formulario propio)
- **RCI Argentina** → `https://rcionline.bciseguros.cl/...`
- **Asistencia en Viaje** → `https://viajes.prietocorreaseguros.cl/`
- **Seguro de Mascotas** → `https://cotizadormascotas.bciseguros.cl/...`

---

## 7. Próximos pasos

1. **Agregar `campos_formulario`** a `web_seguros_catalogo`: columna JSON con esquema de campos por seguro → permite frontend dinámico y futura edición desde panel admin
2. **Panel de administración** (semana siguiente): login trabajadores, roles, ver cotizaciones entrantes, gestionar catálogo
3. **Conectar frontend**: crear `.env.example`, configurar proxy en Vite, documentar cómo hacer fetch al backend
4. **Deployment DigitalOcean**: pendiente recibir credenciales del Droplet
5. **SOAP**: agregar al catálogo cuando haya información del producto
6. **Archivos adjuntos**: implementar cuando se defina integración con Brokerion
