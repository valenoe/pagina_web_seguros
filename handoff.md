# Handoff — Migración CSS (App.css → archivos separados)

---

## 🔴 URGENTE — Conexión a la BD se cae por inactividad ("MySQL server has gone away")

**Fecha:** 2026-07-23. **Prioridad: URGENTE (bug en PRODUCCIÓN).**

**Síntoma (visto en los logs del server, `journalctl -u backend-seguros`):**
```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError)
(2006, "MySQL server has gone away (SSLEOFError(8, 'EOF occurred ...')))")
```
Aparece tras periodos sin tráfico (ej. de madrugada): la primera petición al backend revienta.

**Causa:** `backend-web-seguros/database.py` hace `engine = create_engine(DATABASE_URL)` **sin protección de pool**. La BD cierra las conexiones ociosas (su `wait_timeout`), pero SQLAlchemy reutiliza esa conexión ya muerta → error. Es intermitente y molesto en prod.

**Fix (1 línea, bajo riesgo) — en `backend-web-seguros/database.py`:**
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # verifica la conexión antes de usarla; reconecta si está muerta
    pool_recycle=1800,    # recicla conexiones de más de 30 min (antes de que caduquen)
)
```

**Desplegar:** commit + push a main → en el server `git pull origin main` + `sudo systemctl restart backend-seguros`. (No requiere cambios de BD.)

**Contexto del deploy (server DigitalOcean, para el próximo chat):** el proyecto está en `/var/www/pagina_web_seguros`, rama `main`. Backend con systemd (`backend-seguros.service`), uvicorn en `127.0.0.1:8000`, Apache en 80/443 (vhost `web-seguros.conf`), BD `seguros_web_db`. Actualizar = `git pull` + (si hay cambios de schema) ALTERs a mano en `sudo mysql seguros_web_db` + `systemctl restart backend-seguros` + `npm run build` en `frontend-web-seguros/`. Al 2026-07-23 el server quedó actualizado a `490d6af`.

---

## ⭐ PENDIENTE IMPORTANTE — Notificación por correo de los formularios (contacto + cotización)

**Fecha:** 2026-07-21.
**Estado:** ⬜ NO implementado. Decidido hacerlo; falta ejecutar.

**Problema:** hoy los dos formularios públicos **solo se guardan en la BD** — no avisan a nadie. Para enterarse de un lead o cotización hay que **entrar al panel admin** (`admin-web-seguros`, puerto 5174 → secciones "Leads" y "Cotizaciones") y mirar. **No llega ningún correo.** Confirmado en código: NO hay envío de email en el backend (sin `smtplib`/SMTP/SendGrid/Resend).

- Contacto: `POST /contacto/` → tabla `web_leads_contacto` (`routers/contacto.py`).
- Cotización: `POST /cotizaciones/` → tabla `web_cotizaciones` (`routers/cotizaciones.py`).
- El admin las lee solo-lectura: `GET /admin/leads`, `GET /admin/cotizaciones` (`routers/admin.py:64-72`).

**Objetivo:** que cada vez que entre un formulario nuevo, **llegue un aviso por correo** a la casilla que atienda la corredora.

**Método acordado — Gmail SMTP con una cuenta NUEVA (gratis):**
- **Por qué cuenta nueva:** nadie en la empresa tiene acceso al dominio `prietocorrea.cl`, así que NO se puede usar `segurosdigitales@prietocorrea.cl` como remitente. Se crea un Gmail dedicado (ej. `notificaciones.prietocorrea@gmail.com`).
- Gmail SMTP es gratis (~500 correos/día, de sobra para avisos). Alternativas si algún día se quiere algo más pro: Resend / Brevo (también con plan gratis).
- **Requisito de la cuenta nueva:** activar verificación en 2 pasos + generar una **"contraseña de aplicación"** (16 caracteres) → esa va en el `.env`, NO la clave normal. La contraseña de app es secreta; la pega la usuaria directo en `.env` (que está en `.gitignore`).

**Trabajo a hacer (cuando la usuaria tenga la cuenta Gmail lista):**
1. Servicio de correo en el backend (SMTP Gmail), enviando con `BackgroundTasks` para no frenar la respuesta del formulario.
2. Disparar el aviso desde `crear_contacto` y `crear_cotizacion`.
3. Variables nuevas en `.env` + `.env.example`: remitente (Gmail nuevo), contraseña de app, destinatario(s). Documentar en README.

**Falta que la usuaria defina/entregue:** (a) el correo Gmail nuevo creado; (b) a qué casilla(s) deben llegar los avisos (puede ser la misma nueva y/o su `vchaparro`).

---

## ⭐ PENDIENTE IMPORTANTE — Analítica de visitas (Google Analytics 4)

**Fecha:** 2026-07-21.
**Estado:** ⬜ NO implementado. Decidido hacerlo con **Google Analytics 4**.

**Problema:** hoy NO hay forma de saber cuántas personas visitan la página — no hay ninguna herramienta de analítica instalada (confirmado en código: sin `gtag`/GA/Plausible/Umami; las coincidencias en `Privacidad.jsx` y `package-lock.json` son texto/nombres, no tracking real).

**Método elegido:** **Google Analytics 4** (gratis). Se evaluaron alternativas sin cookies (Cloudflare Web Analytics, Umami, Plausible); la usuaria **está OK con usar cookies**, así que se va con GA4 por el detalle completo (visitas, páginas top, países, dispositivos, tiempo real).

**⚠️ Solo mide con la página PUBLICADA** (Droplet + dominio). En `localhost` no cuenta visitas reales → esta tarea va de la mano con el despliegue.

**Trabajo a hacer:**
1. **La usuaria** crea la propiedad en [analytics.google.com](https://analytics.google.com) (cuenta → propiedad Web con el dominio real) y obtiene el **ID de medición `G-XXXXXXXXXX`** (NO es secreto, va visible en el navegador).
2. **Código:** pegar el fragmento oficial de gtag.js en el `<head>` de `frontend-web-seguros/index.html` con ese ID. (Opcional recomendado: usar `VITE_GA_ID` en `.env` para no trackear en dev; index.html de Vite no lee env directo → o se hardcodea el ID público, o se inyecta por plugin.)
3. **Aviso de cookies:** como GA4 usa cookies, agregar un banner simple ("Usamos cookies para analizar el tráfico — Aceptar"). Pendiente de confirmar por la usuaria si se incluye.

**Falta que la usuaria entregue:** el `G-XXXXXXXXXX` de la propiedad GA4 creada, y decidir si se agrega el banner de cookies.

---

## ⭐ PENDIENTE IMPORTANTE — Renovar el chatbot Corredín (imagen + nombre + leer de la BD)

**Fecha:** 2026-07-21.
**Estado:** ⬜ En renovación. El chatbot está **OCULTO temporalmente** (no eliminado) mientras se rehace.

**Ocultamiento actual:** en `frontend-web-seguros/src/App.jsx` se comentaron el `import ChatBot` y el `<ChatBot />`. Para volver a mostrarlo, descomentar esas 2 líneas (hay nota en el código). **NO está roto — está oculto a propósito.** Todo el código sigue intacto: `components/ChatBot.jsx`, `styles/components/ChatBot.css`, `services/corredinService.js`, `knowledge/corredinKnowledge.js`.

**Qué hay que cambiar al renovarlo:**
1. **Imagen/avatar:** cambiar la imagen actual de Corredín por una adecuada.
2. **Nombre:** ponerle un nombre apropiado (revisar si "Corredín" se mantiene o se cambia; hoy el nombre está en el JSX/estilos `corredin-*` y en los textos del widget).
3. **Leer de la BD (lo principal):** hoy el bot responde con data **hardcodeada** en `src/knowledge/corredinKnowledge.js` (precios UF, coberturas, asistencias, exclusiones). Debe pasar a **leer del backend** — `corredinService.js` ya consume `GET /seguros/` (endpoint público de solo lectura) y tiene fallbacks listos, pero `GET /seguros/` hoy solo devuelve `nombre/descripcion/categoria/url_externa/flags`; falta la data rica.
   - Esto está ligado al pendiente ya existente más abajo: **"🤖 Bot real desde la BD"** (agregar columnas a `web_seguros_catalogo`, actualizar modelo/schemas/admin CRUD, migrar la BD a mano — sin Alembic — y sembrar los datos de `corredinKnowledge.js`). Ver ese punto para el detalle técnico.

**Nota:** la usuaria no está segura de si la imagen/avatar "sale" (se recupera) — verificar de dónde se está tomando hoy al retomar.

---

## PENDIENTE — Normalizar los campos por ramo (materia asegurada / datos por seguro)

**Fecha:** 2026-07-21.

**Objetivo:** que todas las pólizas/cotizaciones **de un mismo tipo de seguro** compartan la **misma estructura de campos**, sin crear una tabla distinta por seguro. Los campos específicos siguen viviendo en el **JSON flexible** que ya existe: `web_polizas.materia_asegurada` (póliza) y `web_cotizaciones.datos_adicionales` (cotización). La idea es una **plantilla por ramo** (config en código `data/materiaPorRamo.js`, o una tabla única `web_ramo_campos` editable desde el admin) que fije qué claves lleva cada ramo.

**Situación actual:**
- `formularios.md` (carpeta madre) define campos para: **Auto, Hogar, Mujer Segura, Garantías**. (Ver también DB / `datos_adicionales`.)
- El **cotizador real es genérico**: hoy solo guarda `region` y `comuna` en `web_cotizaciones.datos_adicionales` (`Cotizador.jsx:105`), NO los campos por ramo. O sea, formularios.md es el plan, aún no implementado.

**Clasificación por seguro (decisión de la usuaria, 2026-07-21):**
- **Formulario/cotizador INTERNO → se desarrolla acá:** **Auto, Hogar, Mujer Segura, Garantías** (los que están en formularios.md).
- **Cotizador EXTERNO / link → NO llegan datos a nuestro sistema:**
  - **Mascotas** (link BCI), **RCI Argentina** (link BCI), **SOAP** (probablemente tendrá link), **Asistencia en Viaje** (cotizador propio, lo hizo otra persona; sus datos NO llegan acá).
  - Para estos, los datos de la **PÓLIZA** (`web_polizas` / `materia_asegurada`) vendrán del **BROKER**. La usuaria buscará después qué campos trae cada uno y los pasará — **para poblar `web_polizas`, NO para el cotizador**.
- **Accidentes Personales:** sin formulario ni link definido aún → TBD.

**🕒 "De ahí vemos" (pendiente posterior, anotado a pedido de la usuaria):** verificar que los datos **coincidan / sean consistentes entre la COTIZACIÓN (`datos_adicionales`) y la PÓLIZA (`materia_asegurada`)** de un mismo ramo — que un hogar cotizado y su póliza emitida tengan los mismos campos. Se aborda después de definir las plantillas.

---

## PENDIENTE — Historial de teléfono/correo del cliente (fecha de modificación)

**Fecha:** 2026-07-21. **Prioridad: media (idea a evaluar).**

**Contexto:** en el **cotizador con sesión iniciada** (ya hecho): los datos NOT NULL de `web_clientes` (nombre, RUT, tipo_cliente) salen **bloqueados en plomo** (no editables). El **correo y el teléfono** (que viven en tablas aparte: `web_cliente_emails`, `web_cliente_telefonos`) **quedan editables**, por si el cliente cambió de número/correo; el valor que use se guarda en la **cotización** (columnas `email`/`telefono` de `web_cotizaciones`).

**La idea a evaluar (planteada por la usuaria):**
- Que el teléfono/correo del perfil se pueda **actualizar con el último usado**, y sobre todo que el cliente pueda después **ver qué números/correos ha usado y cuándo los cambió** (si pregunta "¿qué número tengo registrado?").
- Para eso, `web_cliente_telefonos` y `web_cliente_emails` deberían llevar un campo **`fecha_modificacion`** (o una **tabla de historial** aparte), y la lógica tomaría el **último**.

**Decisiones de diseño pendientes:**
1. ¿El perfil se actualiza solo con lo último ingresado en una cotización, o el cotizador solo lo registra en la cotización sin tocar el perfil? (hoy: solo va a la cotización, no toca el perfil).
2. ¿Basta con `fecha_modificacion` en la misma fila (se pierde el historial al sobrescribir), o se necesita **tabla de historial** para conservar los anteriores? → si se quiere "ver los números que ha usado", **hace falta historial** (no basta un solo campo que se sobrescribe).
3. Alcance: schema (BD.sql + BD viva + host) + backend + UI en el Perfil para mostrar el historial.

**Nota:** la usuaria mencionó que tiene **más ideas extras** sobre esto — anotarlas aquí cuando las pase.

---

## PENDIENTE MENOR (nice-to-have) — Mostrar el valor de la UF del día

**Fecha:** 2026-07-21. **Prioridad: baja.**

Los montos del portal (primas, cuotas, montos asegurados) están **en UF**. Estaría bueno que **en algún lado** aparezca el **valor de la UF del día**, para que el usuario pueda hacer la conversión mental si quiere.

- **NO convertir las cuotas/primas a pesos** (decisión de la usuaria): la UF cambia día a día y mes a mes, así que mostrar "$" fijo al lado de cada cuota confunde. Solo mostrar la UF del día, informativo.
- **Dónde podría ir:** en el detalle de póliza se **quitó** la nota `"Valores en UF (referenciales)."` (`poldet-nota` en `PolizaDetalle.jsx`) porque no gustaba; ese es un buen lugar para poner el "UF hoy: $XX.XXX" en su lugar. O un indicador chico en el header del portal.
- **Cómo (sin dependencias nuevas):** endpoint backend `GET /indicadores/uf` que trae la UF de **mindicador.cl** (`https://mindicador.cl/api/uf`, gratis, sin API key) con `urllib`, la **cachea por día** (misma UF todo el día) y tiene **fallback** al último valor si la fuente falla. El front la pide una vez y la muestra. Fuente oficial alternativa: CMF (`api.cmfchile.cl`, requiere llave gratis).

---

## Objetivo

Dividir `frontend-web-seguros/src/App.css` (~5 900 líneas) en archivos CSS separados, uno por página o componente principal. El archivo único es inmanejable: cualquier cambio de estilo implica buscar en miles de líneas, genera conflictos de merge con el trabajo de Matías en la rama de frontend, y mezcla estilos del portal interno con los de la web pública.

---

## Estado actual

| Página / Componente                   | CSS migrado                              | Import en .jsx            | Eliminado de App.css |
| ------------------------------------- | ---------------------------------------- | ------------------------- | -------------------- |
| Privacidad (Legal)                    | ✅ `styles/pages/Legal.css`              | ✅ `Privacidad.jsx`       | ✅                   |
| Global (reset, variables, tipografía) | ✅ `styles/global.css`                   | ✅ `App.jsx` (línea 1)    | ✅                   |
| Nosotros                              | ✅ `styles/pages/Nosotros.css`           | ✅ `Nosotros.jsx`         | ✅                   |
| Home                                  | ✅ `styles/pages/Home.css`               | ✅ `Home.jsx`             | ✅                   |
| Seguros (público)                     | ✅ `styles/pages/Seguros.css`            | ✅ `Seguros.jsx`          | ✅                   |
| Contacto                              | ✅ `styles/pages/Contacto.css`           | ✅ `Contacto.jsx`         | ✅                   |
| Cotizador                             | ✅ `styles/pages/Cotizador.css`          | ✅ `Cotizador.jsx`        | ✅                   |
| Clientes                              | ✅ `styles/pages/Clientes.css`           | ✅ `Clientes.jsx`         | ✅                   |
| LoginClientes                         | ✅ `styles/pages/LoginClientes.css`      | ✅ `LoginClientes.jsx`    | ✅                   |
| RegistroOnboarding                    | ✅ `styles/pages/RegistroOnboarding.css` | ✅ `RegistroClientes.jsx` | ✅                   |
| Header                                | ✅ `styles/components/Header.css`        | ✅ `Header.jsx`           | ✅                   |
| Footer                                | ✅ `styles/components/Footer.css`        | ✅ `Footer.jsx`           | ✅                   |
| Portal (Dashboard + sub-secciones)    | ✅ `styles/pages/PortalDashboard.css`    | ✅ `Dashboard.jsx`        | ✅                   |
| DetalleSeguro                         | ✅ `styles/pages/DetalleSeguro.css`      | ✅ `DetalleSeguro.jsx`    | ✅                   |
| PerfilCliente                         | ✅ `styles/pages/PerfilCliente.css`      | ✅ `PerfilClientes.jsx`   | ✅                   |

**App.css: 5 918 líneas originales → 0 líneas (archivo vacío, migración completa)**

---

## Estructura definida

```
frontend-web-seguros/src/
├── styles/
│   ├── global.css              ← ✅ creado
│   ├── pages/
│   │   ├── Legal.css           ← ✅ creado
│   │   ├── Home.css            ← ✅ creado
│   │   ├── Seguros.css         ← ✅ creado
│   │   ├── Nosotros.css        ← ✅ creado
│   │   ├── Contacto.css        ← ✅ creado
│   │   ├── Cotizador.css       ← ✅ creado
│   │   ├── Clientes.css        ← pendiente (ver alertas)
│   │   ├── LoginClientes.css   ← pendiente (ver alertas)
│   │   └── RegistroOnboarding.css ← pendiente (ver alertas)
│   └── components/
│       ├── Header.css          ← pendiente
│       ├── Footer.css          ← pendiente
│       └── PortalDashboard.css ← pendiente (y sus sub-secciones)
├── pages/
│   ├── Privacidad.jsx          ← ✅ import añadido
│   ├── Nosotros.jsx            ← ✅ import añadido
│   ├── Home.jsx                ← ✅ import añadido
│   ├── Seguros.jsx             ← ✅ import añadido
│   ├── Contacto.jsx            ← ✅ import añadido
│   ├── Cotizador.jsx           ← ✅ import añadido
│   └── ...
└── App.css                     ← ✅ VACÍO — migración completa, ya no importado en App.jsx
```

Regla: los `.jsx` **no se mueven**, solo se les añade `import '../styles/pages/NombreArchivo.css'`. App.css permanece importado hasta que esté completamente vacío.

---

## Archivos clave

| Archivo        | Ruta                                                        |
| -------------- | ----------------------------------------------------------- |
| ~~App.css~~    | ~~`frontend-web-seguros/src/App.css`~~ ✅ vacío, eliminable |
| Entrada global | `frontend-web-seguros/src/styles/global.css`                |
| Importado en   | `frontend-web-seguros/src/App.jsx` (línea 1)                |

**Nota:** App.jsx ya NO importa App.css — solo importa `styles/global.css`. El archivo App.css existe vacío y puede eliminarse cuando se quiera.  
`LoginClientes.jsx` y `RegistroClientes.jsx` — verificado: **ya no importan App.css**. ✅

---

## Plan / próximos pasos

Siguiente en la cola (paso 6 del plan original):

### 6. `Clientes.css`, `LoginClientes.css`, `RegistroOnboarding.css`

**Alerta crítica — fondo compartido:** En App.css existe un selector de lista compartido entre las tres páginas:

```css
.clientes-panel,
.login-clientes-page,
.registro-onboarding-page {
  background:
    linear-gradient(rgba(4, 18, 68, 0.65), ...), url("/Fondo-login.png");
  background-size: cover;
  background-position: center;
}
```

Al separar en tres archivos, **duplicar** esas propiedades de fondo en cada uno. No refactorizar a clase compartida (sería cambio en el HTML/JSX, fuera del alcance).

Los JSX de Login y Registro que importar son:

- `src/pages/LoginClientes.jsx`
- `src/pages/RegistroClientes.jsx` (ojo: el archivo se llama `RegistroClientes.jsx`, no `RegistroOnboarding.jsx`)

---

### 7. `Header.css` y `Footer.css`

Van en `styles/components/`. El Header ocupa buena parte del bloque de media queries en App.css (todo el bloque `@media (max-width: 1000px)` tiene muchas reglas de hamburguesa, nav móvil, etc.). El Footer tiene reglas en los bloques de 1000px y 700px.

Buscar en App.css:

- Header: selectores `.header`, `.header-spacer`, `.header-logo`, `.header-nav`, `.header-search`, `.search-box`, `.hamburger`, `.mobile-overlay`, `.mobile-nav-login*`, `.header-login*`, `.login-item`, `.login-icon`
- Footer: selectores `.footer`, `.footer-grid`, `.footer-bottom`, `.footer-*`

---

### 8. Portal (dejar para el final)

Los archivos del portal son los más grandes y tienen capas de `!important` acumulados. Migrarlos todos juntos al final, en este orden sugerido:

- `PortalDashboard.css` — `.pc-dashboard`, `.pc-sidebar`, `.pc-main`, `.pc-header`, etc.
- `DetalleSeguro.css` — `.detalle-seguro-*`
- `PerfilCliente.css` — `.perfil-cliente-*`
- `SegurosDisponiblesPortal.css` — `.pc-dashboard .portal-seguros-bloques .seguro-bloque*` (overrides del portal sobre los base de Seguros.css)
- `BeneficiosPortal.css` — `.pc-beneficios-*`

**Alerta:** Los bloques `!important` en portal (especialmente en SegurosDisponibles) tienen 4-5 capas de ajustes superpuestos. Al migrar, **llevar todos los bloques juntos en el mismo orden**; no consolidarlos ni limpiar los `!important` todavía.

---

## Ritual por cada migración

1. Extraer el CSS → nuevo archivo.
2. Agregar el import al `.jsx`.
3. Eliminar el bloque de App.css (incluyendo selectores en media queries compartidas).
4. Verificar visualmente la página en el navegador antes de commitear.
5. Un commit por migración (o por sesión, si se hacen varias de golpe).

---

## Alertas críticas

### 1. Selector de fondo compartido (Clientes / Login / Registro)

```css
.clientes-panel,
.login-clientes-page,
.registro-onboarding-page {
  background: linear-gradient(rgba(4,18,68,0.65), ...), url("/Fondo-login.png");
  ...
}
```

Al separar: **duplicar** en los tres archivos CSS. No intentar unificar en clase compartida.

### 2. `.seguro-bloque` base vs. overrides del portal

Las reglas base de `.seguro-bloque` están en `Seguros.css`. ✅ ya migrado.
Las overrides del portal (`.pc-dashboard .portal-seguros-bloques .seguro-bloque`) siguen en App.css → irán a `SegurosDisponiblesPortal.css`.
No hay conflicto de cascada: el selector del portal tiene mayor especificidad.

### 3. Bloques `!important` acumulados en el portal

Los estilos de `SegurosDisponiblesPortal` tienen 4–5 capas de ajustes sucesivos con `!important`. Al migrarlos, **llevar todos los bloques juntos** en el mismo orden; no consolidarlos todavía.

### 4. Media queries: no separar de sus reglas base

Cada media query que afecta a un componente debe viajar junto a ese componente al nuevo archivo. En App.css quedan media queries compartidas — al migrar cada página hay que extraer sus selectores de esos bloques.

### 5. `.contacto-corredor` — es un componente del PORTAL, no de Contacto

Aunque el nombre confunde, `.contacto-corredor` y `.contacto-corredor img` están definidos dentro del bloque del portal en App.css (cerca de `.pc-advisor-card`). Se migrarán con el portal, NO con Contacto.css.

---

## Responsividad — diagnóstico y plan

### Contexto

Con la migración CSS completa, se realizó una auditoría de responsividad sobre todos los archivos separados. El objetivo es identificar qué tiene breakpoints, qué les falta, y qué está roto en móvil/tablet.

**Progreso actual:** ya están corregidos y **commiteados** `Nosotros.css`, `DetalleSeguro.css`, `PerfilCliente.css`, `RegistroOnboarding.css` y `LoginClientes.css` (commits `c36d97d` y `71d1ac8`). Los breakpoints de `DetalleSeguro` y `PerfilCliente` ya se movieron desde `PortalDashboard.css` (ya no quedan ahí). **`Testimonials.css` también está hecho (sin commitear todavía). Próximo a editar: `Legal.css`.**

### Criterios de corrección

- **`clamp()`** para valores que escalan suavemente: tipografía (`font-size`), padding, gap. Evita múltiples breakpoints solo para reducir tamaños.
- **`@media`** para cambios de layout: columnas que colapsan, elementos que se ocultan, `flex-direction` que cambia.
- Breakpoints objetivo: `≤1000px` (tablet), `≤700px` (móvil).

### Diagnóstico por archivo

| Prioridad  | Archivo                  | Problema principal                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Hecho   | `Nosotros.css`           | ~~`.historia-card` 420px fijos; grid sin colapso; sin ≤700px~~ → resuelto con `clamp()`, `aspect-ratio` y breakpoint ≤700px                                                                                                                                                                                                                                                                                                                                                  |
| ✅ Hecho   | `DetalleSeguro.css`      | ~~Sin media queries propias~~ → breakpoints 1000px + 700px añadidos (movidos desde `PortalDashboard.css`)                                                                                                                                                                                                                                                                                                                                                                    |
| ✅ Hecho   | `PerfilCliente.css`      | ~~Sin media queries propias~~ → breakpoints 1000px + 700px añadidos (movidos desde `PortalDashboard.css`)                                                                                                                                                                                                                                                                                                                                                                    |
| ✅ Hecho   | `LoginClientes.css`      | ~~Sin ≤700px; card apretada; `h1` fijo~~ → `clamp()` en tipografía/padding, breakpoint ≤700px (padding página) y ≤450px (apila los checkboxes de `login-options`)                                                                                                                                                                                                                                                                                                            |
| ✅ Hecho   | `RegistroOnboarding.css` | ~~Padding y `h1` sin ajuste en ≤700px~~ → breakpoints 1000px + 700px añadidos                                                                                                                                                                                                                                                                                                                                                                                                |
| ✅ Hecho   | `Testimonials.css`       | ~~Swiper global sin scope; duplicación con `Home.css`; sin ≤700px~~ → reescrito como única fuente (con `var()`, swiper scopeado, fade-in `.visible`), `clamp()` en tipografía/padding, breakpoints 900px + 700px. Bloque duplicado eliminado de `Home.css`.                                                                                                                                                                                                                  |
| ✅ Hecho   | `Legal.css`              | ~~Sin breakpoint ≤700px~~ → `clamp()` en padding página/hero/documento y en `h1`/`h2`; breakpoint ≤700px (radios + caja de contacto). El 980px quedó solo con el colapso de grid e índice.                                                                                                                                                                                                                                                                                   |
| ⏭️ Omitido | `Clientes.css`           | Ruta `/clientes` deshabilitada (comentada en `Router.jsx`); el botón "Mi Sucursal" del header ya da el acceso. No requiere responsividad.                                                                                                                                                                                                                                                                                                                                    |
| ✅ Hecho   | `Seguros.css`            | ~~Hero con `height: 420px` fija~~ → `min-height: clamp()` + padding `clamp()`, `font-size: clamp()` en `h1`; corregido bug `min-height: 360px` que impedía que la imagen bajara a 240px en ≤1000px; media queries reordenadas. **Modal:** paddings/gap/ícono con `clamp()` (se eliminó el `@media 480px` que saltaba); cajas de precio con `repeat(auto-fit, minmax(180px,1fr))` para que reflowen solas; `<small>/<strong>` del precio estilizados; `h2`/`p` con `clamp()`. |
| ✅ Hecho   | `Cotizador.css`          | ~~`height: calc(100vh - 95px)` en pantalla de éxito se cortaba~~ → `min-height` + sin `overflow:hidden`. **Padding:** `.cotizador` y `.cotizador-box/-info` con `clamp()` (se eliminó el `@media 800px` que bajaba el padding de golpe).                                                                                                                                                                                                                                     |
| ✅ OK      | `Header.css`             | Breakpoints 1300px, 1100px, 1000px — bien cubierto                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ✅ OK      | `Footer.css`             | Breakpoints 1000px, 700px — bien cubierto                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ✅ OK      | `Home.css`               | Breakpoints 1100px, 1000px, 700px — el mejor cubierto del proyecto                                                                                                                                                                                                                                                                                                                                                                                                           |
| ✅ OK      | `Contacto.css`           | Layout single-column aguanta bien; bajo riesgo                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ✅ OK      | `Cotizador.css`          | Breakpoints 1000px, 800px, 700px — bien cubierto (salvo el caso de éxito)                                                                                                                                                                                                                                                                                                                                                                                                    |

**Nota sobre `PortalDashboard.css`:** Tenía 2 428 líneas y albergaba los breakpoints de `DetalleSeguro` y `PerfilCliente`. ✅ Esos breakpoints ya se movieron a sus propios CSS y se eliminaron de `PortalDashboard.css` (ya no quedan selectores `detalle-seguro`/`perfil-cliente` ahí).

### Orden de trabajo (responsividad)

1. ✅ `Nosotros.css` — hecho
2. ✅ `DetalleSeguro.css` + `PerfilCliente.css` — hecho (breakpoints movidos desde `PortalDashboard.css`)
3. ✅ `LoginClientes.css` — hecho
4. ✅ `RegistroOnboarding.css` — hecho
5. ✅ `Testimonials.css` — hecho (única fuente; duplicación eliminada de `Home.css`)
6. ✅ `Legal.css` — hecho (`clamp()` + breakpoint ≤700px movido a 700px; índice encoge con `clamp()`; `min-width:0`+`overflow-wrap` para que el grid baje; `scroll-margin-top:115px` en secciones por el header fijo; padding vertical reducido)
7. ⏭️ `Clientes.css` — **OMITIDO.** La ruta `/clientes` (hub de tarjetas) quedó deshabilitada (comentada en `Router.jsx`, import incluido) porque el botón "Mi Sucursal" del header ya da acceso a Ejecutivo Comercial y a Clientes. La página `Clientes.jsx`/`Clientes.css` siguen en el repo pero sin ruta. No requiere responsividad.
8. ✅ `Seguros.css` — hecho (hero `clamp()`; fix `min-height` imagen ≤1000px; modal pasado a `clamp()`/`auto-fit`, ver fila de la tabla)
9. ✅ `Cotizador.css` — hecho (pantalla de éxito `min-height`; padding `.cotizador`/`.cotizador-box` a `clamp()`, eliminado `@media 800px`)

**Con esto la primera auditoría de responsividad está completa** — todos los CSS de la web pública revisados.

### Segunda pasada (en curso) — pulir saltos bruscos con `clamp()`

Re-revisión para cazar cosas que se pasaron en la primera vuelta: reemplazar saltos de un breakpoint por `clamp()` donde el cambio se sienta brusco (paddings, gaps, tamaños). Criterio: si una propiedad sólo cambia de valor (no de layout) entre breakpoints, es candidata a `clamp()`. Los cambios de layout (grid 2→1, flex-direction) se dejan como media query o se pasan a `repeat(auto-fit, minmax())` cuando aplique.

- ✅ `Header.css` — `gap`/`margin-right` del nav pasados a `clamp(... calc(Nvw - Mpx) ...)`; eliminados `@media 1300px` y `1100px`. El cambio a hamburguesa sigue en 1000px.
- ✅ Why-cards (`Home.css`) — corte 4→2 columnas movido de `@media 1100px` a `1300px` (las 4 cards se apretaban antes); padding de card a `clamp(26px,3vw,42px)`.
- ✅ `Contacto.css` — eliminado `min-height: calc(100vh-150px)` + `align-items:center` (la tarjeta flotaba al medio con huecos enormes arriba/abajo en pantallas altas); paddings y `h1` a `clamp()`, eliminados `@media 1000/800px`.
- ⏳ `Nosotros.css` — **pendiente (estético, dejado para cuando completen la sección).** El `h2` en columnas a mitad de ancho (`historia-left`, `corporativo-text`) se sobredimensiona entre 1000-1300px porque el `vw` se calcula sobre el viewport completo, no sobre la columna. Fix propuesto: bajar el coeficiente a ~`3.6vw` en esos `h2` (separándolos del `.valores-corporativos-header h2`, que es de ancho completo y se queda con `4.5vw`).
- ✅ `RegistroOnboarding.css` — la 1.ª pasada solo colapsaba columnas; ahora pasada completa: `clamp()` en paddings de página/paneles, `h1` (56px), `h2` (38px), logo, botones tipo; fila steps+chip con `flex-wrap` (se desbordaba en móvil) y margen movido al contenedor; botones Atrás/Continuar `flex:1` en ≤700 (se desbordaban por `min-width:150`); fix grid blowout a ~1200px (`minmax(0,…)` en columnas + `min-width:0` en panel e inputs — el panel derecho se "separaba"). Chip Persona/Empresa rediseñado (plomo como los steps, sin emojis). **+ mejoras funcionales, ver sección abajo.**
- ⬜ Falta en la 2.ª pasada: `Footer.css` y el resto del `Home.css` (hero, purpose, partners).

> **Nota:** todo el trabajo de responsividad listado como ✅ está en el working tree **sin commitear**.
>
> **Pendiente menor (Legal):** revisar el espaciado vertical entre textos del documento (`line-height`/`margin` de `p`, `li`, `h2`) — quedó para después.
>
> **Sugerencia pendiente (para después):** en `Seguros.jsx` los precios UF/CLP están escritos a mano (`precioUf`/`precioClp`). Reemplazar la conversión manual por el valor en pesos calculado en vivo con la UF del día de Chile (API tipo `mindicador.cl`). Solo en la página de Seguros, no en el Home.

---

## Validación / seguridad del formulario de Contacto

**Hecho esta sesión**:

- **Front (`Contacto.jsx`):** validación por campo (errores bajo cada input, `.campo-error`), `noValidate` en el form. Obligatorios: **nombre** (solo letras, filtrado en tiempo real — no se pueden teclear `[] <> {}`), **email** (regex) y **mensaje** (no vacío, sin largo mínimo). Teléfono opcional con `PhoneInput` (mín. 5 dígitos). `PhoneInput`: `<select>` con `width:auto` (se adapta al texto) + opción **"Otro…"** para código de país manual.
- **Back (`schemas/contacto.py`):** `nombre` `min_length=1, max_length=100` + `strip()`; `email` `max_length=100`; `mensaje` `max_length=2000`; teléfono regex bajada a `\d{5,15}` para cuadrar con el front. Verificado con pruebas. SQL injection ya cubierto (ORM SQLAlchemy); XSS cubierto por React.

**⬜ Pendientes (NO olvidar):**

1. **Anti-spam / rate-limiting en endpoints públicos.** `/contacto/` (y `/cotizaciones/`) no tienen captcha ni límite de tasa → se pueden automatizar miles de envíos. No es inyección, pero es abuso real. Opciones: `slowapi` (rate-limit por IP), honeypot, o captcha. Tema aparte más grande.
2. **Aplicar el mismo arreglo de teléfono a `RegistroClientes.jsx`.** Su validación es `telefono.replace(/\D/g,"").length < 7`, que incluye el código de país en la cuenta (mismo bug que tenía Contacto) y deja pasar números cortos. Alinear con el criterio de Contacto (mín. 5 dígitos) para consistencia.

---

## Registro de clientes — mejoras funcionales

- **Labels arriba de cada campo** (`.registro-campo` = `<span>` + control), con `*` en los obligatorios. Antes solo había placeholder (se perdía al escribir). Formato igual a Contacto (azul, sin mayúsculas, pegado al cuadro).
- **Steps + chip fijos arriba:** el panel derecho pasó a `justify-content: flex-start` y el `<form>` ocupa el alto restante con `.registro-actions { margin-top:auto }` → los botones quedan anclados abajo. Antes todo iba centrado y los steps "saltaban" según los campos de cada paso.
- **Región/Comuna como `<select>` dependientes:** la lista que estaba hardcodeada en `Cotizador.jsx` se extrajo a **`src/data/regionesComunas.js`** (compartida; ya con las 16 regiones). La importan **Cotizador** y **Registro**; editar ese archivo actualiza ambos. Comuna se deshabilita hasta elegir región y se resetea al cambiarla (`cambiarRegion`).
- **Paso 3 (contacto) en 1 columna** (`.registro-form-grid-stack`): correo/teléfono/whatsapp apilados a ancho completo para dar espacio al `PhoneInput`.

---

## 🔧 EN CURSO — Integración del dashboard del cliente (rama `integracion-dashboard`)

**Contexto:** la parte pública (Home, Seguros, Cotizador, Contacto, Nosotros, Legal, Login, Registro) ya está en `main` (PR squash #16 "Separación CSS y responsividad"). Falta integrar el **dashboard del cliente** que está en la rama de Matías: **`origin/matsnow30/frontend`**.

### ⚠️ Por qué NO se hace un `git merge` directo

La rama de Matías **se separó ANTES de la migración de CSS**: trae de vuelta `App.css` (6.800 líneas), `Appviejo.css`, `Dashboardviejo.jsx`, `api/api.js` (viejo), `hola.txt`, y choca en ~40 archivos del sitio público que ya reescribimos. Un merge total = pesadilla y revive el `App.css` viejo.

**Estrategia: integración quirúrgica** — traer solo lo del dashboard con `git checkout origin/matsnow30/frontend -- <archivo>`, NO mergear la rama entera.

### Clasificación de sus archivos

- 🗑️ **Basura, NO traer:** `Appviejo.css`, `Dashboardviejo.jsx`, `api/api.js` (viejo; el bueno es `services/api.js`), `hola.txt`.
- 🟢 **Sitio público: quedarse con los de main**, ignorar los suyos (Header, Footer, Home, Seguros, Nosotros, Login, Registro, Privacidad, Purpose, WhyChooseUs, Testimonials, PromoCarrusel, App.css, Router).
  - `Router.jsx`: **NO necesita merge** — main ya tiene todas las rutas del portal. Lo único distinto de Matías son retrocesos (quitó `ScrollToTop`, re-activó el hub `/clientes` que deshabilitamos a propósito).
- 📊 **Dashboard: traer de Matías** → `Dashboard.jsx`, `DetalleSeguro.jsx`, `PerfilClientes.jsx`.
- 🆕 **Features nuevas suyas: traer** → `components/ChatBot.jsx`, `knowledge/corredinKnowledge.js`, `services/corredinService.js`, + imágenes nuevas de `public/`.

### ✅ Hecho (rama `integracion-dashboard`)

- Traídos los archivos del dashboard + chatbot + imágenes de `public/`.
- **Fix de estilos del dashboard:** sus 3 páginas (`Dashboard.jsx`, `DetalleSeguro.jsx`, `PerfilClientes.jsx`) **no importaban ningún CSS** (dependían del `App.css` global de él). Se les agregó el import correcto: `PortalDashboard.css`, `DetalleSeguro.css`, `PerfilCliente.css` respectivamente. `PortalDashboard.css` ya cubre ~80% de las clases (65/81); el usuario copió a mano las que faltaban (modal de beneficios `pc-beneficio-modal-*`).
- **El build pasa sin errores** (`npm run build`) → `services/api.js` de main ya tiene las funciones que usa el `Dashboard.jsx` de Matías. **No** hizo falta merge de api.js.

### ✅ Hecho — sesión 2026-06-24

- **ChatBot montado.** Agregado `import ChatBot` + `<ChatBot />` en `src/App.jsx` (junto a `<WhatsAppButton />`). Ya se renderiza.
- **Estilos del ChatBot recuperados.** Las clases `corredin-*` NO existían en el repo (estaban solo en el App.css de Matías, que no trajimos). Se extrajo el bloque desde `App_MATI.css` **líneas 5599–6021** → nuevo archivo `src/styles/components/ChatBot.css`, importado en `ChatBot.jsx`. (OJO: NO incluir las líneas 6023+ → esas son `pc-beneficio-modal-*`, que ya están en `PortalDashboard.css`.) Las variables `--pc-blue/-dark/-orange` que usa ya están en `global.css`.
- **Auditoría de cobertura CSS de los 4 archivos nuevos** (`Dashboard`, `DetalleSeguro`, `PerfilClientes`, `ChatBot`): **todas las clases reales tienen estilo.** Únicas 2 sin CSS en ningún lado: `.pc-header-greeting` (usa `style={{}}` inline) y `.pc-hero-empty` (un `<div>` vacío espaciador) — tampoco las tenía Matías, son inofensivas. Las demás "faltantes" eran falsos positivos (valores de filtro como `todos`/`vehiculos` dentro de ternarios `className={x==="todos"?"active":""}`).
- **Responsividad dashboard — 1.ª tanda** (`PortalDashboard.css`):
  - 7 encabezados de tamaño fijo → `clamp()` (escalan en móvil, desktop intacto): `.pc-header h1`, `.pc-hero-card h2`, `.pc-stats strong`, `.pc-next-payment h2`, `.pc-full-panel h2`, `.pc-cotizar-header h2`, `.pc-seguros-disponibles-v2 h2`. NO se tocó la zona del carrusel de seguros con `!important` (líneas ~1190, 1860–2110), por la alerta del handoff.
  - **Quiebre a 1000px arreglado:** antes la sidebar se apilaba **arriba** empujando el contenido (se sentía "violento"). Ahora a ≤1000px la sidebar es un **cajón deslizante oculto** (`position:fixed` + `translateX(-100%)`), con botón hamburguesa (`.pc-menu-toggle`) en el header y fondo oscuro (`.pc-sidebar-backdrop`). Estado nuevo en `Dashboard.jsx`: `menuAbierto`. Se cierra al tocar el backdrop, "Inicio" o "Conoce más". Sobre 1000px todo queda idéntico.
    - **✅ BUG resuelto (sesión 2026-06-25):** la `transition: transform 0.3s ease` se **movió a la regla base `.pc-sidebar`** (estaba dentro del `@media`), así anima también al cruzar el breakpoint → al agrandar, el menú entra deslizándose en vez del snap. (Detalle: en desktop la sidebar vuelve a `position:static` de golpe mientras el transform anima; se ve "raro pero funciona", aceptado por ella.)
    - **✅ Machitas al redimensionar sobre 1000px (sesión 2026-06-25):** tres tarjetas tenían `transition: 0.25s` (= `transition: all`) → al hacer resize se animaba ancho/alto y el borde/sombra quedaban arrastrándose. Acotadas a las propiedades que el hover sí anima: `.pc-actions-grid button` (background, color), `.pc-beneficios-categorias button` (transform, background, border-color, color), `.pc-beneficio-card` (transform, box-shadow). Las otras `transition:0.25s` (sidebar nav, flechas/dots del carrusel) se dejaron: tienen tamaño fijo, no causan el problema.

### 🎯 OBJETIVOS DE LA RAMA (acordados en conversación)

0. **🧩 DIVIDIR el `Dashboard.jsx` (7.647 líneas) y CONECTARLO al backend real — el verdadero objetivo de la rama.**

   **Contexto:** `Dashboard.jsx` es un monolito de ~7.600 líneas con ~40 `useState` y 10 "vistas" ya implementadas (`resumen`, `mis-seguros`, `polizas`, `cotizaciones`, `documentos`, `perfil`, `siniestro`, `cuotas`, `beneficios`, `beneficiarios`). Todas viven en un solo archivo. Hay que **partirlo en componentes por vista** y, en paralelo, dejar listo el **enganche con los datos reales**.

   **⚠️ Hay DOS backends (clave para no confundirse):**
   - **Mi backend (FastAPI, el que controlamos):** contacto, cotizaciones, catálogo de seguros (`/seguros/`), login/token de cliente. Esto sí podemos tocar/extender.
   - **El backend del BROKER (`backend.sistemas.prietocorreaseguros.cl`):** pólizas reales, siniestros, beneficios/Club del cliente, pagos. **Tiene su propia API** y **todavía NO está conectado**.

   **Modelo de trabajo para la división (acordado):**
   1. **Extraer la UI tal como está**, sin pelear con el origen del dato. Si hoy se alimenta de datos demo/fallbacks, se deja igual.
   2. **Por cada vista extraída, anotar su "contrato de datos"**: qué consume y de dónde _debería_ venir → `mi-backend` / `broker` / `demo-hardcodeado` / `NO EXISTE AÚN`.
   3. Todo lo que sea `broker` o `NO EXISTE` → **alerta en este handoff** (ver tabla "Fuentes de datos / pendiente reconexión" abajo). Asumimos que **muchas cosas no existen todavía**; no es bug, es trabajo futuro marcado.
   4. **Nada se rompe por un dato que falte** — si una vista depende de algo inexistente, se deja con su estado vacío/demo y se marca; no se bloquea la extracción.

   **Orden de extracción (acordado):** empezar por el **Club (`beneficios`)** como **piloto** — es casi autocontenido (solo usa `beneficios`, `categoriaBeneficioActiva`, `beneficioSlide`, `beneficioSolicitado`), bajo riesgo, ideal para estrenar el patrón (qué estado se va con la vista, qué se pasa por props, dónde viven los helpers compartidos). **Inicio (`resumen`) se deja para después**: es la vista más acoplada y crítica (es la portada y consume pólizas/pagos/alertas/cotizaciones); se extrae cuando el patrón ya esté probado.

   **Reestructuración del menú (acordada):** la sidebar hoy solo expone "Inicio". Debe pasar a tener: **Inicio**, **Mis Seguros**, **Reportar Siniestro**, **Club PrietoCorrea**, **Explorar Seguros**. Mapeo a vistas existentes: Inicio→`resumen`, Mis Seguros→`mis-seguros`, Reportar Siniestro→`siniestro`, Club PrietoCorrea→`beneficios`, Explorar Seguros→`cotizaciones`. (Las vistas ya existen en el monolito; el menú solo no las exponía.)

   **🧭 Navegación por URL real (acordado — "que al cambiar de componente cambie la ruta").** ✅ Hecho (2026-06-25): la URL es ahora la **fuente de verdad** de la vista activa. Antes la vista era estado interno (`useState`); ahora se deriva del parámetro de ruta:
   - Rutas: `/clientes/dashboard` → `resumen`; `/clientes/dashboard/:vista` → esa vista (`/club` usa `beneficios`, etc.). Se agregó `<Route path="/clientes/dashboard/:vista">` en `Router.jsx` (apunta al mismo `<Dashboard/>`).
   - En `Dashboard.jsx`: `vista` se calcula con `useParams()` (con fallback a `?vista=`/`location.state` y a `resumen`); **`setVista` se conservó pero ahora hace `navigate(...)`** en vez de mutar estado → **NO hubo que tocar las ~18 llamadas a `setVista`**. Se eliminó el `useEffect` que sincronizaba `?vista=`. Se corrigió `VISTAS_PERMITIDAS[0]` de `"Resumen"`→`"resumen"` (nunca matcheaba).
   - `DetalleSeguro.jsx`: `volverAlPortal()` ahora navega a `/clientes/dashboard/cotizaciones` (antes `?vista=`).
   - Beneficios: back/forward del navegador funciona y los links de cada sección son compartibles. **`npm run build` pasa.** Sin commitear.
   - **Pendiente (evolución):** los slugs son los keys de vista (`beneficios`, no `club`); se pueden "embellecer" después. Más adelante, al extraer cada vista a su componente, se puede pasar a rutas anidadas reales con `<Outlet>` + `<NavLink>` (este paso ya dejó la URL sincronizada, que era lo pedido).

   **🔌 Fuentes de datos / pendiente reconexión** (se va llenando a medida que se extrae cada vista):

   | Vista                                            | Dato                                                       | Fuente                                 | Estado                                                                                                                                                                                      |
   | ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | Club (`beneficios`)                              | lista de beneficios                                        | **broker** `/portal/mis-beneficios`    | ⛔ NO EXISTE AÚN — hoy `beneficios` llega vacío y cae al fallback `BENEFICIOS_DEMO` (Kimagen, AB Kineintegral) dentro de `ClubBeneficios.jsx`                                               |
   | Club (`beneficios`)                              | nombre + RUT del cliente (comprobante)                     | mi-backend (`getMiCuenta`)             | ✅ existe — se pasa por props `nombreVisible` / `rut`                                                                                                                                       |
   | Reportar Siniestro (`siniestro`)                 | listado de siniestros existentes                           | **broker** `/portal/mis-siniestros`    | ⛔ NO EXISTE AÚN — el arreglo interno arranca vacío a propósito (no inventar casos)                                                                                                         |
   | Reportar Siniestro (`siniestro`)                 | pólizas reportables (para elegir cuál)                     | **broker** (`polizas`)                 | ⚠️ hoy puede venir vacío; se pasa por prop `polizas`                                                                                                                                        |
   | Reportar Siniestro (`siniestro`)                 | autocompletar formulario (nombre/RUT/correo/tel/dirección) | mi-backend (`getMiCuenta`)             | ✅ existe — props `datosPerfil` / `nombreCliente`                                                                                                                                           |
   | Reportar Siniestro (`siniestro`)                 | envío del reporte                                          | —                                      | 🛠️ hoy genera **PDF/HTML local** (descarga + correo manual); falta endpoint real de envío                                                                                                   |
   | Mis Seguros — Pólizas (tab)                      | pólizas contratadas                                        | **broker** (`polizas`/`getMisPolizas`) | ⚠️ hoy vacío → estado vacío. Usa `polizasNormalizadas`. **Descripción del seguro:** vendrá de NUESTRA BD (`web_seguros_catalogo`/`/seguros/`) matcheando la póliza — el broker no la tiene. |
   | Mis Seguros — Documentos (tab)                   | documentos del cliente                                     | **broker**                             | ⚠️ vacío → fallback derivado de las pólizas; el visor de PDF se borró con la vista muerta (reconectar)                                                                                      |
   | Mis Seguros — Beneficiarios (tab)                | beneficiarios por póliza                                   | **broker**                             | ⛔ NO EXISTE AÚN — hoy vacío                                                                                                                                                                |
   | Mis Seguros — Pagos y cuotas (tab, `Cuotas.jsx`) | pagos/cuotas                                               | **broker** `/portal/mis-pagos`         | ⚠️ vacío → estado vacío                                                                                                                                                                     |
   | ~~Mis Seguros — Coberturas~~                     | ~~coberturas~~                                             | —                                      | ❌ **ELIMINADA** (para una corredora las coberturas viven en el PDF de la póliza → pestaña Documentos)                                                                                      |

   **✅ Hecho — extracción piloto del Club (sesión 2026-06-25):**
   - Nuevo componente **`src/pages/dashboard/ClubBeneficios.jsx`** (estrena la carpeta `pages/dashboard/` para la división por vistas). Es **autocontenido**: maneja su propio estado (`categoriaBeneficioActiva`, `beneficioSlide`, `beneficioSolicitado`), sus datos demo, derivaciones, helpers (`generarCodigoBeneficio`, `solicitarBeneficio`, etc.) y el modal de comprobante. El padre solo le pasa `beneficios`, `nombreVisible`, `rut`.
   - **Del `Dashboard.jsx` se eliminaron** esos 3 `useState`, las derivaciones (`beneficiosBase/Filtrados/Destacados`, `beneficioPrincipal`, `beneficiosActivos`), `categoriasBeneficios`, `beneficiosDemo`, los 5 helpers del Club y el modal. El monolito bajó de **7.583 → 7.187 líneas**.
   - El modal (`.pc-beneficio-modal`, `position:fixed`) se movió dentro del componente; al ser overlay full-screen no cambia el layout. `formatearFecha` se duplicó como copia local en el componente (candidato a util compartida `pages/dashboard/` más adelante).
   - **Patrón validado** para las siguientes vistas: estado propio de la vista → al hijo; datos crudos + identidad → props. **`npm run build` pasa.** Sin commitear. Falta verificar en navegador (entrar al portal y abrir "Club").

   **✅ Hecho — extracción de Reportar Siniestro (sesión 2026-06-25):**
   - Nuevo componente **`src/pages/dashboard/ReportarSiniestro.jsx`**. Era la vista MÁS grande del monolito: **~3.840 líneas dentro de un IIFE** (`{vista === "siniestro" && (() => {...})()}`), con generación de PDF/HTML, paginación, modo digital/PDF, archivo de respaldo y el formulario de ~60 campos.
   - Se movieron al componente sus **9 `useState`** (incl. `formularioSiniestro` de 60 campos) — son exclusivos de esta vista. El render se trasladó **verbatim** (cirugía por rango de líneas con Node, no a mano). Props del padre: `polizas`, `datosPerfil`, `nombreCliente`.
   - **Dashboard.jsx bajó de ~8.920 → 5.021 líneas.** Verificado: el componente NO referencia ninguna otra variable del padre (scan explícito, porque en JS una var no definida no rompe el build, solo da error en runtime), y en Dashboard no quedan referencias huérfanas a los estados movidos. **`npm run build` pasa.**
   - ⚠️ Sin verificar en navegador todavía — esta vista es compleja (PDF/form), conviene probar: abrir "Reportar Siniestro", llenar el form y generar el PDF. Sin commitear.
   - **Acumulado de la división:** Dashboard pasó de 7.647 (inicio de la rama) → **5.021** líneas. Extraídos: Club + Reportar Siniestro.

   **✅ Hecho — vista `documentos` muerta eliminada + Mis Seguros extraído (sesión 2026-06-25):**
   - **Eliminada la vista `documentos` suelta** (~480 líneas) y quitada de `VISTAS_PERMITIDAS`. Estaba **muerta/duplicada**: nada en la UI navegaba a ella (`abrirMisSeguros("documentos")` lleva a Mis Seguros con la pestaña Documentos). El UI real de documentos es **una pestaña de Mis Seguros**. Su lógica de datos NO se borró (la usa la pestaña). Probablemente se creó antes de integrar Documentos dentro de Mis Seguros. ⚠️ Efecto colateral: el modal de preview de PDF vivía en esa vista → se fue; `abrirPreviewDocumento` quedó como **no-op** (setea estado que ya nadie lee) hasta reconectar el visor.
   - **Nuevo componente `src/pages/dashboard/MisSeguros.jsx`** con sus 3 pestañas (Coberturas / Beneficiarios / Documentos). Es **PRESENTACIONAL**: las derivaciones (`coberturas*`, `beneficiarios*`, `documentos*`) son exclusivas de esta vista pero se **quedaron en el padre** (que las computa igual) y se pasan ya listas → extracción de **cero riesgo** (no se movió ni se rompió la cadena de derivaciones). Recibe **27 props**.
   - ⚠️ Esas 27 props son un **olor** anotado a propósito: ese bloque de derivaciones (líneas ~741-997 de Dashboard) es candidato a moverse a un **hook compartido `usePortalData`** en una pasada futura, que limpiaría la firma. `tabMisSeguros` se queda en el padre porque `abrirMisSeguros` (desde Inicio) lo controla para abrir una pestaña concreta.
   - **`npm run build` pasa** + scan explícito: el componente solo usa sus props (las coincidencias de "coberturas/beneficiarios/documentos" son strings de UI, no variables). Sin commitear. Falta verificar en navegador.
   - **Acumulado:** Dashboard **7.647 → 3.918** líneas. Extraídos: Club, Reportar Siniestro, Mis Seguros. Borrada: vista documentos duplicada.

   **✅ Hecho — sesión 2026-07-02 (commit `408520a` "continuacion extracción" ya pusheado; el resto de esta sesión sin commitear todavía):**
   - **Bug de runtime resuelto:** al abrir el portal reventaba `setBeneficioSlide is not defined` (Dashboard.jsx) — era un `useEffect` huérfano del carrusel del Club que quedó tras extraer `ClubBeneficios`. Borrado. (Recordatorio: el build NO detecta estos huérfanos, solo revientan en runtime → **hay que abrir cada vista extraída en el navegador**.)
   - **Pestaña `Coberturas` de Mis Seguros ELIMINADA** (decisión de la usuaria): para una corredora las coberturas exactas las define la aseguradora y viven en el **PDF de la póliza → pestaña Documentos**. Mantener una tabla de coberturas a mano era duplicar dato mutable. Se borró: import `getMisCoberturas` (comentado en `services/api.js`), estado `coberturas`, su fetch en el `Promise.allSettled`, y todas las derivaciones (`coberturasNormalizadas`, `coberturasFilas`, contadores) → **Mis Seguros bajó de 27 a ~22 props**. Los 2 botones de Inicio que abrían esa pestaña ahora van a Documentos. Default de `tabMisSeguros`: `documentos`.
   - **Mis Seguros: rediseño + CSS propio.** Nuevo **`src/styles/pages/MisSeguros.css`** (importado en el componente); el JSX quedó **sin un solo estilo inline** (todo en clases `ms-*`). Se movió también `pc-stats-strip` → `ms-stats-strip` (era exclusiva de Mis Seguros). Las `pc-*` que quedan (`pc-panel`, `pc-full-panel`, `pc-panel-title`, `pc-empty`, `pc-status`) son **compartidas** con otras vistas → se quedan en `PortalDashboard.css`.
   - **Mejoras visuales de Mis Seguros:** los 3 estados vacíos usan el mismo `.pc-empty` (antes cada pestaña era distinta — problema heredado de Matías); botones "Explorar seguros / Contactar ejecutivo" fijos arriba (fuera de los estados vacíos) con hover unificado (fondo oscuro + letras blancas); resumen de 4 tarjetas → **tira compacta** `ms-stats-strip`; **tabla con `overflow-x: auto` + `min-width`** (scroll horizontal en móvil en vez de deformarse); **pestañas tipo carpeta** (activa blanca/brillante y más alta al frente, inactiva plomo suave atrás, unión redondeada). Orden: **Documentos primero, luego Beneficiarios**.
   - **Responsividad Mis Seguros:** `clamp()` para lo que solo escala (padding interno de lengüeta, padding del cuerpo, gap de la tira); breakpoints para layout (`ms-head` a columna, `ms-actions` fila 50/50 en ≤700 y **vuelve a columna en ≤460**, `ms-filters` 4→2→1). El par estructural de la carpeta (`ms-tabs` padding + `ms-folder-body` radius) se dejó **fijo** (están acoplados; si se clampean debe ser juntos). Pestañas con `flex-wrap: nowrap` (no se apilan) y **abrevian a `Doc`/`Ben` bajo 350px** (dos `<span>` alternados por CSS).
   - **`npm run build` pasa.** Verificado en navegador por la usuaria (le gusta). Ella commitea esta tanda.

   **🔜 Plan acordado (2026-07-02):** **extraer las vistas que faltan y DESPUÉS pasar el CSS a archivos propios** (como se hizo con Mis Seguros). Empezando por **Cuotas**.

   **📍 Estado del monolito (Dashboard.jsx ≈ 1.288 líneas):**
   - **Extraídas a `pages/dashboard/`:** `MisSeguros` ✅ (revisada a fondo), `Cuotas` ✅ (3ª pestaña de Mis Seguros con estilo de Documentos; buscador con lupita), `ExplorarSeguros` ✅ (build pasa, **falta verificar en navegador + CSS**), `Perfil` ✅ (recién extraída, build pasa, **falta verificar en navegador + CSS**), `ReportarSiniestro` 🟡 (falta verificar en navegador), `ClubBeneficios` (`Club-PC`) 🟡 (falta verificar en navegador).
   - **Aún inline (por extraer + revisar):** `resumen`/Inicio (~200, **la última** — es la portada, la más acoplada), `polizas` (~40).

   **✅ Hecho — extracción de Perfil (sesión 2026-07-02):** Nuevo **`src/pages/dashboard/Perfil.jsx`** (1.152 líneas: datos personales, avatar, cambio de clave con OTP simulado, preferencias de notificación). **AUTOCONTENIDO**: se movieron 9 `useState` exclusivos (editandoPerfil, modalClaveAbierto, pasoClave, codigoSeguridad, codigoIngresado, nuevaClave, confirmarClave, mensajePerfil, preferenciasPerfil). Los helpers del render ya eran locales al IIFE → se movieron con el render. Solo **5 props compartidas**: `datosPerfil`/`setDatosPerfil`, `avatarPerfil`/`setAvatarPerfil`, `nombreCliente` (alimentan también header/saludo/avatar). Extracción por cirugía Node. Dashboard **2.404 → 1.288**. Build pasa, sin huérfanos, sin refs del padre.

   **🔤 Slug de URL:** la vista `cotizaciones` se renombró a **`explora`** (URL `/clientes/dashboard/explora`) en los 7 puntos donde era key de vista (VISTAS_PERMITIDAS, `setVista(...)`, `vista === ...`, y `volverAlPortal` de DetalleSeguro). NO se tocó la variable de datos `cotizaciones` (cotizaciones del cliente) ni `getMisCotizaciones`.

   **🎉 Acumulado de la división:** Dashboard **7.647 → 1.288** líneas. Extraídos: Club, Reportar Siniestro, Mis Seguros (+ Cuotas y Pólizas como pestañas), Explorar Seguros, Perfil.

   **✅ Perfil a CSS propio + responsividad:** nuevo `styles/pages/Perfil.css` (clases `perfil-*`), `Perfil.jsx` sin estilos inline. Conversión 1:1 + media queries ≤1000/≤700/≤460 (grid a 1 col, hero apila, stats 4→2→1). CSS/responsividad **listos**.

   **✅ Perfil — dos círculos de avatar unificados + header limpio en Perfil (sesión 2026-07-02):** había 2 avatares que llevaban a Perfil (el del saludo, izq. 54px, y el de la zona usuario, der. 42px con "Editar perfil"). Se **eliminó el del saludo** (era foto duplicada) → queda solo el de la derecha. Además, **en la vista Perfil el header oculta el saludo y el avatar/"Editar perfil"** (`{vista !== "perfil" && ...}`) porque ya estás en tu cuenta; solo queda la campana. Es la única vista sin esas dos cosas arriba.

   ### 🔧 EN CURSO — REFORMA FUNCIONAL DEL PERFIL (plan acordado 2026-07-02)

   El CSS ya está, pero el Perfil **parece roto y tiene relleno falso**. Objetivo: perfil decente = **solo datos reales, editables y que se guarden de verdad**; nada de relleno decorativo que finge ser dato.

   **Plan en orden (de lo más barato/impactante a lo más grande):**
   1. **✅ HECHO — Correctness visual (sesión 2026-07-02):**
      - **Mensajes por tipo:** el estado pasó de string a `{ texto, tipo }`; helper `mostrarMensaje(texto, tipo, ms)`. Clases `.perfil-mensaje--success` (verde) / `--error` (rojo) / `--info` (naranjo). Ya no sale el éxito en rojo.
      - **Aviso como TOAST flotante** (`position: fixed`) para no descuadrar el layout. **OJO:** estaba abajo-derecha y quedaba TAPADO por el ChatBot (`z-index: 999999`, misma esquina) → se movió a **arriba-derecha** (`top: 84px; right: 24px; z-index: 200`). En móvil va arriba a lo ancho.
      - **Claridad de la foto:** el botón dice "Cambiar foto" si ya hay, "Subir foto" si no.
   2. **Separar real vs. hardcodeado (auditoría + decisión):**
      - Real hoy (de `getMiCuenta`): nombre, RUT, correo, teléfono, dirección.
      - **Relleno FALSO a quitar o conectar:** los 4 stats ("Último acceso: Hoy", "Estado", "Seguridad", "Notificaciones"), los chips ("Cliente activo", "Persona natural", **"Backend ready"**), la lista "Sesiones y actividad", "Privacidad y documentos". Nada de eso es real.
      - Falta **región/comuna** en el form (ni existen hoy). Reusar `src/data/regionesComunas.js` (ya lo usan Cotizador y Registro).
   3. **Conectar el guardado al backend real:** hoy `guardarPerfil` (datos) **solo escribe en localStorage** → NO persiste. Endpoint ya existe: `actualizarMiCuenta(token, data)` (PUT `/portal/perfil`). Falta conectarlo.
      - **✅ FOTO ya conectada al backend (adelanto del #3, sesión 2026-07-02):** `manejarAvatar` en `Perfil.jsx` ahora **sube la foto** con `subirFotoPerfil(token, archivo)` → `POST /portal/perfil/foto` (guarda el archivo en `backend/uploads/fotos/` y setea `cliente.foto_perfil`). El backend devuelve URL **relativa** (`/uploads/fotos/xxx`); se añadió `export const API_URL` + helper **`fotoUrl(foto)`** en `api.js` que le antepone el host. `Dashboard.jsx` usa `fotoUrl()` al cargar `getMiCuenta` para mostrar la foto guardada al recargar. El `avatarPerfil`/`localStorage["avatar_cliente"]` ahora guardan la **URL completa**. Antes se guardaba la foto como **base64 en localStorage** → excedía el límite ~5MB y no persistía (por eso "desaparecía al recargar").
      - **⚠️ Requiere backend corriendo + cliente logueado con JWT real** (con token "demo" o backend caído → toast rojo "No se pudo subir la foto").
      - **⚠️ Gap: "Quitar foto"** (`limpiarAvatar`) solo limpia local → **la foto del servidor reaparece al recargar** (no hay endpoint de borrado). Falta endpoint DELETE o un `actualizarMiCuenta` que setee `foto_perfil=""`.
      - **🔴 AUDITORÍA datos registro ↔ backend (sesión 2026-07-02) — HALLAZGO:** el **registro** (`RegistroClientes.jsx`) pide nombre, RUT, tipo_cliente, correo, teléfono, whatsapp, **región, comuna, dirección, fecha_nacimiento**, contraseña. Pero `web_clientes` solo tiene columnas `rut`, `tipo_cliente`, `nombre_o_razon_social`, `foto_perfil`, `cliente_activo`, `fecha_registro`, `updated_at` (+ tablas `web_cliente_telefonos` [telefono/whatsapp] y `web_cliente_emails`), y el endpoint de registro (`routers/auth.py`) solo guarda rut/tipo_cliente/nombre + teléfonos + email. **→ dirección, región, comuna y fecha_nacimiento SE PIERDEN al registrarse** (no hay dónde guardarlos). `ClientePerfilOut` tampoco los devuelve → el campo **Dirección** del Perfil nunca trae dato real.
      - **PENDIENTE (backend):** agregar columnas `direccion`, `region`, `comuna`, `fecha_nacimiento` a `web_clientes` (`ALTER TABLE` manual — no hay Alembic), actualizar `models/cliente.py` + schemas (entrada registro y `ClientePerfilOut`), y guardarlos en el registro y en `actualizarMiCuenta` (PUT `/portal/perfil`).
      - **PENDIENTE (frontend, cuando exista la columna):** conectar `guardarPerfil` a `actualizarMiCuenta` (hoy solo localStorage); agregar **región/comuna** al form (reusar `src/data/regionesComunas.js`); mostrar **tipo_cliente** real (hoy hardcodeado "Persona natural").
   4. **Notificaciones (feature aparte, al final):** la campana del header abre un **dropdown feo**; lo ideal es una **página dedicada** de notificaciones en vez del dropdown. Es su propia feature.

   **Estado:** punto 1 ✅ listo. Foto del punto 3 ✅ conectada al backend.

   **🚧 DECISIÓN DE ORDEN (2026-07-02): PRIMERO unir el formulario de registro con el backend, ANTES de tocar el siguiente punto del Perfil.** El registro sí crea la cuenta (guarda rut/tipo_cliente/nombre + teléfonos + email y hace login), pero **dirección, región, comuna y fecha_nacimiento se pierden** porque no hay columna. No tiene sentido agregar región/comuna al form del Perfil ni conectar `guardarPerfil` mientras el dato ni siquiera se persiste en el registro. Entonces el trabajo es, en este orden:
   **Progreso (sesión 2026-07-02):**
   1. **BD — ✅ HECHO.** Se agregaron las 4 columnas a `web_clientes` (`fecha_nacimiento date`, `direccion varchar(300)`, `region varchar(100)`, `comuna varchar(100)`, todas `NULL`), ubicadas tras `nombre_o_razon_social`. Aplicado en **DB.sql** (tabla completa actualizada) **y en la BD viva** (`ALTER TABLE` corrido por la usuaria; verificado que quedó idéntico al DB.sql). SQL de referencia:
      ```sql
      ALTER TABLE `web_clientes`
        ADD COLUMN `fecha_nacimiento` date         DEFAULT NULL AFTER `nombre_o_razon_social`,
        ADD COLUMN `direccion`        varchar(300) DEFAULT NULL AFTER `fecha_nacimiento`,
        ADD COLUMN `region`           varchar(100) DEFAULT NULL AFTER `direccion`,
        ADD COLUMN `comuna`           varchar(100) DEFAULT NULL AFTER `region`;
      ```
   2. **Backend Python — ⬜ SIGUIENTE (en este orden):**
      - `models/cliente.py` → agregar las 4 columnas al modelo `Cliente`.
      - Schemas → `RegistroIn` (aceptar los campos) y `ClientePerfilOut` (devolverlos).
      - `routers/auth.py` (`/auth/registro`) → guardar `direccion/region/comuna/fecha_nacimiento`.
      - PUT `/portal/perfil` (`actualizarMiCuenta`) → que también los actualice.
   3. **Registro (front) — ⬜:** que `RegistroClientes.jsx` mande esos campos.
   4. **Recién ahí, seguir con el Perfil:** punto 2 (limpiar relleno + región/comuna) y el resto del 3 (conectar `guardarPerfil` a `actualizarMiCuenta` + borrado de foto). Por último el 4 (notificaciones).

   > **Recordatorio:** cuando se toque el schema de la BD, aplicar el cambio **en las dos** — DB.sql (versionado, para el Droplet) **y** la BD viva. No hay Alembic → es a mano.

   **✅ HECHO — Paso 2 backend (columnas cliente) + Paso 3 registro front (sesión 2026-07-03):** modelo `Cliente`, `RegistroIn`, `ClientePerfilOut`, `ClientePerfilUpdate`, `/auth/registro` (ramas crear y reactivar) y PUT `/portal/perfil` ya manejan `fecha_nacimiento/direccion/region/comuna`. `RegistroClientes.jsx` ya los envía. Build backend+front OK.

   **✅ HECHO — Refactor: API como ÚNICA fuente del perfil, fuera el espejo de localStorage (sesión 2026-07-03).** La usuaria pidió "nada en localStorage, info real, no copia vieja". Antes el perfil se **duplicaba** en localStorage (`nombre_cliente`, `correo_cliente`, `telefono_cliente`, `direccion_cliente`, `rut_cliente`, `avatar_cliente`) y 6 archivos leían/escribían ese espejo → datos que se desincronizaban.
   - **Nuevo `src/context/ClienteContext.jsx`** (React Context = fuente compartida): hace `getMiCuenta` **una vez** al montar (si hay token), normaliza la respuesta del backend a la forma de la UI (`nombre/rut/correo/telefono/direccion/region/comuna/fecha_nacimiento/foto`), y expone `cliente`, `cargando`, `actualizarCliente(payload)` (PUT + refresca en vivo), `subirFoto(archivo)` (POST foto + refresca), `recargarCliente`, `limpiarCliente`. Envuelto en `App.jsx` (`<ClienteProvider>`).
   - **Migrados a `useCliente()`:** `Dashboard` (deriva `datosPerfil/avatarPerfil/nombreCliente` del contexto; sacó `getMiCuenta` de su `Promise.allSettled` y todo el bloque de espejo; logout/sesión-expirada llaman `limpiarCliente`), `Perfil` (borrador local editable sembrado del contexto + `useEffect` que no pisa mientras se edita; `guardarPerfil`→`actualizarCliente`, avatar→`subirFoto`; **sin props**), `ExplorarSeguros`, `ReportarSiniestro`, `DetalleSeguro` (prefill vía `useEffect`), y `LoginClientes` (ya solo guarda `token`; purga los espejos viejos).
   - **Resultado:** `localStorage` solo conserva `token` y `cuenta_recordada` (sesión / recuérdame — legítimo, NO es dato duplicado). Se eliminaron también fallbacks hardcodeados falsos (`12.456.789-3`, `correo@cliente.cl`). **`npm run build` pasa.**
   - **⚠️ Falta probar en navegador/celular:** re-loguear (para purgar espejos viejos) y verificar header/saludo, editar perfil (que persista al recargar), detalle de seguro (prefill), reportar siniestro (autocompletar) y explorar seguros. Al recargar hay un parpadeo breve mientras responde `getMiCuenta` (normal). Sin commitear.
   - **Gap conocido:** "Quitar foto" sigue solo local (no hay endpoint DELETE) → la foto del server vuelve al recargar.
   - **Limpieza:** borrados `pages/PerfilClientes.jsx` + `styles/pages/PerfilCliente.css` (código muerto, no ruteado; era el perfil viejo de Matías con datos falsos).

   **✅ HECHO — Perfil muestra TODOS los datos + whatsapp/teléfono bien conectados (sesión 2026-07-03):** el editar-perfil solo tenía nombre/RUT/correo/teléfono/dirección y un "tipo cliente" hardcodeado. Ahora incluye **fecha de nacimiento** (solo persona), **WhatsApp**, **Región** y **Comuna** (selects dependientes reusando `data/regionesComunas.js`), y **tipo cliente REAL** (persona→"Persona natural" / empresa→"Empresa").
   - **Backend (hueco detectado por la usuaria):** teléfono y whatsapp viven en `web_cliente_telefonos` con `tipo`. `ClientePerfilOut` derivaba `telefono` de `telefonos[0]` (a ciegas) y **whatsapp no existía**. Corregido: deriva `telefono`/`whatsapp` **por tipo**; `ClientePerfilUpdate` acepta `whatsapp`; el PUT `/portal/perfil` usa un helper `guardar_telefono(tipo, valor)` que actualiza/crea la fila del tipo correcto. Contexto normaliza `whatsapp`. Build backend+front OK, sin commitear.
   - ⚠️ Requiere **reiniciar uvicorn** (cambió el schema). Clientes registrados ANTES del fix del registro traen región/comuna/fecha/whatsapp como "Pendiente" (nunca se guardaron).

   **✅ HECHO — Perfil funcional completo (sesión 2026-07-08):** se conectaron/limpiaron las partes que quedaban falsas del perfil.
   - **Cambiar contraseña REAL:** nuevo `PUT /portal/password` (`CambioPasswordIn`) que verifica la clave actual con bcrypt y guarda la nueva hasheada. Se **eliminó el "código de seguridad" falso** (se generaba en el navegador con `Math.random`, no daba seguridad). El modal ahora pide **clave actual + nueva + confirmar**; el error del backend ("La contraseña actual no es correcta") se muestra tal cual (`cambiarPassword` en api.js hace fetch propio para rescatar el `detail`). **Mín. 6 caracteres** (front+back). Los 3 campos tienen **ojito** (mostrar/ocultar, ícono SVG `IconoOjo`) y `autoComplete="new-password"` para que el navegador no autocomplete la clave guardada. Los campos arrancan vacíos (nada preguardado).
   - **Recuperar contraseña (olvido):** PENDIENTE, va en el **login** (no en el perfil) y necesita envío de correo (pendiente #3). Anotado.
   - **Preferencias de notificación REALES:** nueva columna `preferencias_notificacion` (JSON/longtext) en `web_clientes`. `ClientePerfilOut` la devuelve parseada (dict) vía `field_validator`; `ClientePerfilUpdate` la acepta; el PUT la guarda con `json.dumps`. Contexto normaliza `preferencias`. En el front los 6 interruptores se cargan de la BD y **cada toggle persiste al instante** (optimista + reversión si falla). Default de `pagos` = **activado**. `PREFERENCIAS_DEFAULT` cuando el cliente nunca las guardó.
   - **Todos los datos del registro en el perfil:** se agregaron **fecha de nacimiento** (solo persona), **WhatsApp**, **Región/Comuna** (selects dependientes reusando `data/regionesComunas.js`) y **tipo cliente REAL** (persona/empresa, ya no hardcodeado "Persona natural"). Backend: teléfono/whatsapp se derivan **por tipo** en `web_cliente_telefonos` (antes tomaba `telefonos[0]` a ciegas y whatsapp no se exponía); PUT usa `guardar_telefono(tipo, valor)`.
   - **Quitar foto REAL:** nuevo `DELETE /portal/perfil/foto` (borra archivo + `foto_perfil=None`). Ya no reaparece al recargar. Contexto expone `eliminarFoto`.
   - **Fotos livianas:** al subir, el backend redimensiona a **máx 400px** y convierte a **WebP** (Pillow, calidad 80). Avatares de ~20-40KB. Se guardan en disco (`uploads/fotos/`, siempre `.webp`).
   - **⚠️ CAMBIOS DE BD (aplicar en DB.sql + BD local + BD del host):** `ALTER TABLE web_clientes ADD COLUMN preferencias_notificacion longtext DEFAULT NULL AFTER comuna;` (ya en DB.sql).
   - **⚠️ NUEVA DEPENDENCIA:** `Pillow` (instalado en el venv local con `pip install Pillow`). **Falta instalarla en el host** y NO hay `requirements.txt` en el backend → dependencias sin listar (riesgo deploy; pendiente generar el requirements).
   - Verificado en runtime por la usuaria: cambiar/quitar foto y ver que se refleja en header/saludo/otras vistas (gracias al ClienteContext). Falta commitear/subir al host.

   **✅ DECISIÓN — Inicio se queda en Dashboard:** NO se extrae `resumen`/Inicio; es la portada/hub, se deja inline en el monolito a propósito (lo pidió la usuaria).

   **✅ Hecho — vista huérfana `polizas` → pestaña "Pólizas" de Mis Seguros (sesión 2026-07-02):** `polizas` era **código muerto** (en VISTAS_PERMITIDAS pero nada navegaba a ella, solo por URL). Se **eliminó** y se **reconvirtió en la 1ª pestaña de Mis Seguros: "Pólizas"** (seguros contratados: seguro/categoría, número, compañía, estado, vencimiento) con el estilo de Documentos (tira compacta + buscador + tabla `ms-cols-pol` con scroll + estado vacío). Sin props nuevas (usa `polizasNormalizadas`; +1 `useState` local para el buscador). **Default de `tabMisSeguros` → `polizas`**; los botones de Inicio "Ver todas"/"Revisar mis seguros" abren esa pestaña. Mis Seguros = **4 pestañas: Pólizas · Documentos · Beneficiarios · Pagos y cuotas.** Build pasa.
   - **⚠️ Pendiente (descripción de la póliza):** la "descripción general del seguro" saldrá de **NUESTRA BD** (`web_seguros_catalogo` / `GET /seguros/`) matcheando la póliza con el catálogo — **el broker NO tiene esa sección**. Por ahora la pestaña va sin descripción.

   ***

   ## 🎯 PRIORIDAD ACTUAL (2026-07-02): PASADA DE CSS de las secciones del dashboard

   **La división de `Dashboard.jsx` está TERMINADA** (7.647 → ~1.288 líneas; solo Inicio queda inline por decisión). **Lo que falta es el CSS**: varias vistas se extrajeron con sus **estilos inline tal cual** y hay que pasarlas a su **CSS propio** (clases, como se hizo con Mis Seguros y Perfil). Patrón a seguir: crear `styles/pages/<Vista>.css`, importar en el componente, reemplazar cada `style={{}}` por clases, dejando las `pc-*` compartidas en `PortalDashboard.css`.

   **Estado por componente (conteo de `style={{` al 2026-07-02):**

   | Componente                                | Inline            | CSS propio            | Estado                                                         |
   | ----------------------------------------- | ----------------- | --------------------- | -------------------------------------------------------------- |
   | `MisSeguros` (+ Cuotas + Pólizas)         | 0                 | `MisSeguros.css`      | ✅ listo                                                       |
   | `Perfil`                                  | 0                 | `Perfil.css`          | ✅ listo (con responsividad ≤1000/≤700/≤460)                   |
   | `Cuotas`                                  | 0                 | usa `MisSeguros.css`  | ✅ listo (es pestaña de Mis Seguros)                           |
   | **`ReportarSiniestro`**                   | **110**           | —                     | ⛔ **el más grande** — hacer pasada de CSS                     |
   | **`ExplorarSeguros`**                     | **43**            | —                     | ⛔ pasada de CSS (carrusel + detalle + form cotización)        |
   | **`ClubBeneficios`**                      | **34**            | —                     | ⛔ pasada de CSS                                               |
   | `Dashboard.jsx` (shell header)            | 15                | —                     | 🟡 inline menor (avatares/notificaciones del header); opcional |
   | `Inicio` (`resumen`, inline en Dashboard) | usa clases `pc-*` | `PortalDashboard.css` | ✅ ya con clases                                               |

   **Orden sugerido de la pasada de CSS:** ExplorarSeguros o ClubBeneficios primero (más chicos, 43/34), ReportarSiniestro al final (110, el más pesado). El shell del Dashboard (15) es limpieza menor opcional.

   **✅ Hecho — extracción de Explorar Seguros (`cotizaciones`) (sesión 2026-07-02):** Nuevo **`src/pages/dashboard/ExplorarSeguros.jsx`** (1.064 líneas: catálogo con carrusel filtrable + detalle con formulario de cotización compacta WhatsApp/correo). **AUTOCONTENIDO**: TODO era exclusivo de esta vista → se movieron 6 `useState` (seguroDetalleId, seguroSlide, filtroSeguros, ordenSeguros, segurosPorVista, cotizacionCompacta), los 2 `useEffect` (resize→segurosPorVista, reset de slide), el catálogo hardcodeado `segurosDisponibles` (8 seguros), 6 derivaciones del carrusel y ~11 funciones. Solo **4 props compartidas**: `cotizaciones`, `nombreCliente`, `abrirWhatsApp`, `formatearFecha`. En `abrirDetalleCotizacion` se quitó el `setVista("cotizaciones")` (ya redundante dentro de la vista). Extracción por **cirugía con Node** (bloques interleaved con derivaciones de otras vistas). Dashboard **3.461 → 2.404**. Build pasa, sin huérfanos, sin refs del padre. Sigue con estilos inline (CSS a futuro).
   - **Menú:** se eliminó el ítem duplicado **"Explorar Seguros"** del sidebar (lo había agregado la usuaria); el botón **"Conoce más"** de la promo ya lleva a la misma vista `cotizaciones`.

   **✅ Hecho — extracción de Cuotas + integrada como PESTAÑA de Mis Seguros (sesión 2026-07-02):** Nuevo **`src/pages/dashboard/Cuotas.jsx`** ("Pagos y cuotas"). **AUTOCONTENIDO**: `normalizarPago`, `pagosNormalizados/Pendientes/Realizados`, `montoPendiente`, `proximoPago` e `iniciarPago` eran exclusivos de cuotas → se MOVIERON al componente (del padre se borraron 81 líneas). Recibe 8 props: `pagos` (state crudo, sigue en el padre porque el fetch está en el `Promise.allSettled`), `polizasNormalizadas` (derivación compartida), y los helpers `normalizarEstado`/`formatearMoneda`/`formatearFecha`/`textoEstado`/`abrirWhatsApp`/`setVista`. Extraído **con los estilos inline tal cual** (CSS propio queda para la pasada de CSS).
   - **DECISIÓN (usuaria):** Pagos y cuotas **NO es una vista/página aparte** → es la **3ª pestaña dentro de la carpeta Mis Seguros** (Documentos · Beneficiarios · **Pagos y cuotas**). Por eso: se quitó `"cuotas"` de `VISTAS_PERMITIDAS` y el bloque `{vista === "cuotas"}` del padre; `Cuotas` ahora se importa y renderiza **dentro de `MisSeguros.jsx`** (pestaña `cuotas`); su root dejó de ser `pc-panel pc-full-panel` (pasó a fragment, sin `<h2>` — el cuerpo de la carpeta ya es el panel). `MisSeguros` recibe 3 props extra (`pagos`, `polizasNormalizadas`, `formatearMoneda`) y las reenvía a `Cuotas`. El botón "Realizar pago" de Inicio pasó de `setVista("cuotas")` a `abrirMisSeguros("cuotas")` (abre Mis Seguros en esa pestaña). Etiqueta corta móvil: `Pagos`.
   - Dashboard **3.798 → 3.461**. Build pasa, sin huérfanos. **Falta verificar en navegador** + **falta la pasada de CSS** (Cuotas sigue con estilos inline y `pc-stats` de 4 cuadros; armonizar con la tira compacta/carpeta como el resto de Mis Seguros).

1. **🤖 Bot real desde la BD — el principal.**
   - **Aclaración importante (para no asustarse):** el bot **NO** es WhatsApp Business API (eso es otra cosa, de Meta, paga). Corredín es un widget de chat en la propia web. Y conectarlo a la BD **no es peligroso**: el bot solo llama a `GET /seguros/` (endpoint **público, de solo lectura**, el mismo que ya alimenta la página pública de Seguros). El navegador NUNCA toca la BD directo; solo la API (FastAPI) lo hace. La data privada (pólizas/pagos) ya exige token y se queda así.
   - **Lo que falta:** hoy `GET /seguros/` (tabla `web_seguros_catalogo`) solo devuelve `nombre`, `descripcion`, `categoria`, `url_externa` y flags. **Toda la data rica** (precio UF/CLP, coberturas, asistencias, exclusiones, deducible) vive **solo hardcodeada** en `src/knowledge/corredinKnowledge.js`. El `corredinService.js` ya consume `/seguros/` y tiene fallbacks listos para esos campos.
   - **Trabajo:** (a) agregar columnas a `web_seguros_catalogo`; (b) actualizar modelo `models/catalogo.py` + schemas (`SeguroOut`, `SeguroIn`, `SeguroAdminOut`) + el admin CRUD (`routers/admin.py` ya tiene crear/editar/borrar seguros); (c) migrar la BD — **no hay Alembic** → `ALTER TABLE` manual; (d) **sembrar** los datos de `corredinKnowledge.js` en la BD; (e) ajustar el front.
   - **DECISIÓN TOMADA:** los datos los mantendrá **ella/Matías desde el panel admin** → por eso van a la BD (editable), no quedan en JS.
   - **DECISIÓN PENDIENTE:** cómo guardar las listas (coberturas/asistencias/exclusiones): **columnas JSON** en la misma tabla (recomendado, simple) vs tablas relacionadas (normalizado, más código). Falta confirmar.

2. **📱 Responsividad dashboard** — en curso (ver arriba). ✅ Bug de animación al agrandar y machitas al redimensionar resueltos (2026-06-25). Falta: resto de breakpoints a revisar visualmente y la 2.ª pasada `clamp()` en más secciones.

3. **📧 Conectar correo (feature nueva).** Hoy el backend **NO envía ningún correo**: `/contacto/` y `/cotizaciones/` solo guardan el lead/cotización en la BD. Se quiere que al enviar Contacto / Cotización **llegue un correo a la corredora** (y ojalá confirmación al cliente). Necesita: librería de mail (`fastapi-mail`/SMTP) + **casilla + credenciales SMTP** (las consigue ella). Va de la mano con el anti-spam de abajo.

4. **✅ Probar el dashboard en runtime** — login cliente → portal → detalle → perfil, con la API corriendo. (La ruta es `/clientes/dashboard`; redirige a `/login-clientes` si no hay token. Para revisar solo layout sin backend: en consola `localStorage.setItem("token","demo")` y entrar a la ruta — renderiza con datos demo gracias a `Promise.allSettled`.)

5. **🧹 Limpiar y cerrar:** verificar que no se coló basura (`Appviejo.css`, `Dashboardviejo.jsx`, `api/api.js` viejo, `hola.txt`) → commit → PR `integracion-dashboard` → `main` (squash). **No commitear/pushear hasta que ella lo diga.**

### 💡 Candidatos extra (ya anotados como pendientes)

- **Anti-spam / rate-limiting** en `/contacto/` y `/cotizaciones/` (hoy se pueden automatizar miles de envíos). Va junto al #3.
- **Fix del teléfono en `RegistroClientes.jsx`** (mismo bug que ya se arregló en Contacto: cuenta el código de país y deja pasar números cortos).
- **UF→peso en vivo** en la página de Seguros (conversión real con la UF del día).

### Comandos de referencia

```bash
# La rama ya está creada desde origin/main:
git checkout integracion-dashboard
# Traer un archivo puntual de Matías:
git checkout origin/matsnow30/frontend -- frontend-web-seguros/src/<ruta>
```

---

## ✅ Resuelto — `Testimonials.css` (paso 5, hecho)

Ya ejecutado el plan de abajo: `Testimonials.css` es ahora la única fuente y el bloque duplicado se eliminó de `Home.css` (incluidas sus reglas en el `@media 700px`). Se conservaron `.testimonios.visible` + `opacity:0` en Testimonials, así que el fade-in del observer sigue funcionando. Pendiente: verificar en navegador y commitear. Hallazgos originales (referencia):

### Contexto

`<Testimonials />` se renderiza **solo dentro de `Home.jsx`** (línea 21). Por eso en Home se cargan a la vez `Home.css` y `Testimonials.css`, y **ambos definen las mismas clases** (`.testimonios`, `.testimonial-card`, `.quote`, `.cliente`, swiper…). Es duplicación casi total con cascada frágil (gana el que el bundle importe último).

### La copia de `Home.css` (líneas 434–567 + reglas en su `@media 700px`) es la "buena"; la de `Testimonials.css` está peor:

| Aspecto           | `Home.css` (mejor)                               | `Testimonials.css` (peor)                                                             |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Fade-in al scroll | ✅ `opacity:0` + `.testimonios.visible`          | ❌ **falta** — sin esto la animación del `IntersectionObserver` del JSX no existiría  |
| Selectores Swiper | ✅ scopeados: `.testimonios .swiper-button-prev` | ❌ **globales**: `.swiper-button-prev` → se filtran a cualquier otro Swiper del sitio |
| Colores           | ✅ `var(--pc-blue/orange)`                       | ❌ hardcodeados `#07195a` / `#f47c20`                                                 |
| `h2` font-weight  | 800                                              | 700                                                                                   |
| Breakpoint        | 700px                                            | 900px                                                                                 |

> **Dato clave:** la regla `.testimonios.visible` **solo existe en `Home.css`**. El JSX agrega la clase `visible` por el observer, así que hoy la animación de entrada depende enteramente de `Home.css`, no del CSS del propio componente.

Detalle menor: `Testimonials.css` tiene formato raro (una línea en blanco entre cada propiedad), herencia de copy-paste.

### Plan a ejecutar

1. **`Testimonials.css` pasa a ser la única fuente:** reemplazar su contenido con la versión buena de `Home.css` (con `var()`, swiper scopeado a `.testimonios`, y el fade-in `.visible`).
2. Responsividad: mantener el breakpoint **900px** (cuando el Swiper baja a 2 tarjetas) **y agregar ≤700px** propio.
3. **Eliminar de `Home.css`** el bloque testimonios (líneas 434–567 + las reglas `.testimonios*` dentro de su `@media 700px`), dejándolo solo con lo de Home.

⚠️ **Riesgo a cuidar:** al borrar de `Home.css` hay que llevarse **sí o sí** el `.testimonios.visible` y el estado inicial `opacity:0`, o se pierde la animación de entrada.

---

## Alertas críticas (vigentes)

### 1. Selector de fondo compartido (Clientes / Login / Registro)

```css
.clientes-panel,
.login-clientes-page,
.registro-onboarding-page {
  background:
    linear-gradient(rgba(4, 18, 68, 0.65), ...), url("/Fondo-login.png");
  background-size: cover;
  background-position: center;
}
```

Al separar: **duplicar** en los tres archivos CSS. No intentar unificar en clase compartida.

### 2. `.seguro-bloque` base vs. overrides del portal

Las reglas base de `.seguro-bloque` están en `Seguros.css` ✅. Las overrides del portal (`.pc-dashboard .portal-seguros-bloques .seguro-bloque`) siguen en App.css → irán a `SegurosDisponiblesPortal.css`. No hay conflicto de cascada: el selector del portal tiene mayor especificidad.

### 3. Bloques `!important` acumulados en el portal

Los estilos de `SegurosDisponiblesPortal` tienen 4–5 capas de ajustes sucesivos con `!important`. Al migrarlos, **llevar todos los bloques juntos** en el mismo orden; no consolidarlos todavía.

### 4. Media queries: no separar de sus reglas base

Cada media query que afecta a un componente debe viajar junto a ese componente al nuevo archivo. En App.css quedan media queries compartidas — al migrar cada página hay que extraer sus selectores de esos bloques.

### 5. `.contacto-corredor` — es un componente del PORTAL, no de Contacto

Aunque el nombre confunde, `.contacto-corredor` y `.contacto-corredor img` están definidos dentro del bloque del portal en App.css (cerca de `.pc-advisor-card`). Se migrarán con el portal, NO con `Contacto.css`.

---

## Ritual por cada migración / corrección

1. Extraer el CSS → nuevo archivo (o editar el existente).
2. Agregar el import al `.jsx` si aplica.
3. Eliminar el bloque de App.css (incluyendo selectores en media queries compartidas).
4. Verificar visualmente la página en el navegador antes de commitear.
5. Un commit por migración (o por sesión, si se hacen varias de golpe).

### 🧾 REDISEÑO Mis Seguros + detalle de póliza (2026-07-09, EN CURSO)

**Forma de datos del broker viejo (Brokerion)** — fuente en `C:\Users\valen\Documents\Prieto_Correa_seguros\bot_sistema_polizas` (Playwright que navega el sistema viejo + lector de PDF). El bot guarda un `metadata.json` por póliza con secciones: `maestro` (id, tipo/ramo, compañía, estado, numero_poliza, fechas, nombre, rut, materia), `informacion_general`, `cliente` (nombre/rut/correo/celular), `materia_asegurada` (VARÍA por ramo: hogar→construcción/dirección/monto edificio/contenido; auto→patente/marca/modelo…), `datos_pago` (compañía, forma_pago, producto, prima bruta UF), `cuotas` (numero/monto UF/vencimiento/estado), `archivos_adjuntos` (PDFs), `notas`, `bitacora`, `renovaciones`, `endosos`. El **lector de PDF** (`bot_hogar/extraccion_pdf.csv`) agrega el desglose fino de prima que el broker web no da: `monto_asegurado_uf, prima_neta_uf, prima_afecta_uf, prima_exenta_uf, iva_uf, prima_bruta_uf, prima_total_uf` (todo UF). El lector es **parcial**: casas info completa, autos solo primas → **campos nullable**.

**✅ HECHO — schema `web_polizas` ampliado** (DB.sql + BD local; **falta host**). Se agregó: `ramo`, `materia`, `producto`, `forma_pago` (varchar); desglose de prima en UF `prima_neta, prima_afecta, prima_exenta, iva` + `monto_asegurado` (decimal); y `materia_asegurada` **longtext JSON** (detalles variables por ramo). El `prima` existente = **prima total** (se decidió bruta = total, una sola columna). Modelo `Poliza`, `PolizaPortalOut` (+ramo/materia) y `PolizaDetalleOut` (+todo el desglose + `materia_asegurada` parseado + `documentos`) actualizados. Relación `Poliza.documentos` (viewonly) para traer los PDFs por póliza.

**✅ HECHO — UI:** nueva página **`pages/dashboard/PolizaDetalle.jsx`** + CSS (ruta `/clientes/dashboard/poliza/:idPoliza`, standalone con "Volver a Mis Seguros"). Secciones: Resumen · Prima (desglose UF, solo filas con valor) · Materia asegurada (itera el JSON) · Cuotas (tabla) · **Documentos** (PDFs de esa póliza). En **Mis Seguros**: botón **"Ver"** por fila en Pólizas → abre el detalle; **tab "Documentos" ELIMINADO** (los documentos viven dentro de cada póliza; decisión usuaria). La acción rápida de Inicio "Ver documentos" pasó a "Mis pólizas". `npm run build` pasa.

**⚠️ Pendientes:** (1) `ALTER TABLE web_polizas` en la **BD del host** (ver abajo). (2) Los props de documentos que MisSeguros ya no usa (documentosDemo, filtrosDocumentos, etc.) quedaron pasándose desde Dashboard sin uso → limpieza futura. (3) Poblar/POBLAR datos demo enriquecidos para probar. (4) El resto del dashboard del cliente y sus tablas también se van a rediseñar (esto fue solo Mis Seguros, el primero).

**ALTER para el host (MySQL, sin `IF NOT EXISTS`):**
```sql
ALTER TABLE `web_polizas`
  ADD COLUMN `ramo` varchar(50) DEFAULT NULL,
  ADD COLUMN `materia` varchar(300) DEFAULT NULL,
  ADD COLUMN `producto` varchar(100) DEFAULT NULL,
  ADD COLUMN `prima_neta` decimal(12,2) DEFAULT NULL,
  ADD COLUMN `prima_afecta` decimal(12,2) DEFAULT NULL,
  ADD COLUMN `prima_exenta` decimal(12,2) DEFAULT NULL,
  ADD COLUMN `iva` decimal(12,2) DEFAULT NULL,
  ADD COLUMN `monto_asegurado` decimal(14,2) DEFAULT NULL,
  ADD COLUMN `forma_pago` varchar(50) DEFAULT NULL,
  ADD COLUMN `materia_asegurada` longtext DEFAULT NULL;
```

### 🆕 Decisiones de modelado de datos (acordadas en conversación — agregar al #1)

**Tres conceptos SEPARADOS, no se mezclan ni se duplican:**

1. **`web_seguros_catalogo` (enriquecer la existente, NO tabla nueva)** — info fija de cada seguro. Agregar columnas:

```sql
   ALTER TABLE web_seguros_catalogo
     ADD COLUMN `precio_referencia` varchar(150),   -- ⚠️ SIEMPRE referencial (ver nota corredora)
     ADD COLUMN `coberturas` longtext,              -- JSON (array de strings)
     ADD COLUMN `asistencias` longtext,             -- JSON
     ADD COLUMN `exclusiones` longtext,             -- JSON
     ADD COLUMN `deducible` varchar(150),
     ADD COLUMN `para_quien` text;                  -- "familias, conductores, pymes"
```

- **DECISIÓN TOMADA (era pendiente): columnas JSON**, no tablas relacionadas. Razón: las listas (coberturas/asistencias/exclusiones) solo se MUESTRAN (el bot las imprime), no se filtran ni cruzan. JSON evita 3 tablas + joins + CRUDs. En MariaDB el JSON se guarda como `LONGTEXT` validado. ⚠️ En el admin, tratar estos campos como **array de strings** (lista editable), no textarea de texto crudo.

2. **`web_ofertas` (tabla NUEVA)** — descuentos TEMPORALES con fecha. Distinta del club. Un seguro puede tener varias (1→muchos vía `seguro_id`).

```sql
   CREATE TABLE `web_ofertas` (
     `id_oferta` integer PRIMARY KEY AUTO_INCREMENT,
     `seguro_id` integer,                          -- NULL = aplica a todos
     `titulo` varchar(150) NOT NULL,
     `porcentaje_descuento` decimal(5,2),
     `descripcion` text,
     `fecha_inicio` date NOT NULL,
     `fecha_fin` date NOT NULL,
     `activo` boolean DEFAULT true,
     `fecha_desactivacion` timestamp DEFAULT NULL,
     `desactivado_por` integer DEFAULT NULL,
     FOREIGN KEY (`seguro_id`) REFERENCES `web_seguros_catalogo` (`id_seguro`),
     FOREIGN KEY (`desactivado_por`) REFERENCES `web_usuarios_internos` (`id_usuario`)
   );
```

- El bot/web filtra ofertas vigentes: `WHERE activo = true AND CURDATE() BETWEEN fecha_inicio AND fecha_fin`. La oferta se "apaga" sola al pasar la fecha.

3. **`web_club_beneficios` (tabla NUEVA)** — beneficios del club. Distinto de ofertas (no necesariamente con fecha). `solo_clientes` filtra promo abierta vs. exclusiva de cliente.

```sql
   CREATE TABLE `web_club_beneficios` (
     `id_beneficio` integer PRIMARY KEY AUTO_INCREMENT,
     `titulo` varchar(150) NOT NULL,
     `descripcion` text,
     `solo_clientes` boolean DEFAULT false,        -- true = exclusivo cliente; false = promo abierta
     `porcentaje_descuento` decimal(5,2) DEFAULT NULL,  -- opcional, si el beneficio es un %
     `categoria` varchar(50),
     `orden_display` integer DEFAULT 0,
     `activo` boolean DEFAULT true,
     `fecha_desactivacion` timestamp DEFAULT NULL,
     `desactivado_por` integer DEFAULT NULL,
     FOREIGN KEY (`desactivado_por`) REFERENCES `web_usuarios_internos` (`id_usuario`)
   );
```

- Si la persona NO tiene login → el bot muestra solo `solo_clientes = false`. Logueada → muestra todos.

**⚠️ Nota corredora (legal/comercial):** Prieto Correa es **corredora, no compañía**. El precio final lo pone la aseguradora y varía por cliente. `precio_referencia` es SIEMPRE un ejemplo ("desde 0,33 UF anual, referencial"). El bot/web debe cerrar toda respuesta de precio con algo tipo _"valor referencial — el precio final depende de tu perfil; cotiza para el valor exacto"_. Solo cargar datos de los seguros disponibles en la web, sin inventar precisión que no se tiene.

**⚠️ Regla transversal — soft-delete (Ley 21.719):** Por la nueva ley chilena de datos, **nada se elimina, todo se desactiva**. TODAS las tablas (nuevas y existentes) usan el patrón:

```sql
`activo` boolean DEFAULT true,
`fecha_desactivacion` timestamp DEFAULT NULL,
`desactivado_por` integer DEFAULT NULL  -- FK a web_usuarios_internos
```

La BD ya venía haciendo soft-delete (`seguro_activo`, `cliente_activo`, etc.) — mantener ese patrón y sumarle `fecha_desactivacion` + `desactivado_por` para trazabilidad/auditoría. (`desactivado_por` apunta a usuarios internos del admin, NULL mientras esté activo.)

- Pendiente decidir: ¿sumar también `creado_por`? Si se quiere trazabilidad completa va en par con `desactivado_por`. Tabla de auditoría aparte = sobreingeniería por ahora.
- Recordar: la ley también exige poder responder "derecho de supresión" del titular — se maneja a nivel de proceso, no rompe este diseño.

**Criterio "¿qué va a la BD?" (corregido):** como el objetivo es que **el equipo (no-programador) edite todo desde el admin sin depender de un programador**, casi todo el CONTENIDO va a BD editable. Solo queda en frontend la estructura visual (layout, colores, componentes). Nada de contenido hardcodeado.

---

## 🚀 DEPLOYMENT — Conectar el Droplet de DigitalOcean a GitHub

**✅ ESTADO (actualizado): YA está pseudo-subido a un link de prueba PRIVADO.**
- URL: **http://web.prietocorreaseguros.cl/**
- Acceso protegido con contraseña básica (Basic Auth): usuario **`prueba`**, clave **`1234web`**.
- El trabajo (contexto ClienteContext + perfil con todos los datos + fix telefono/whatsapp) **ya está commiteado** en la rama y subido al host en este link privado. Falta la validación en runtime sobre el host.

**Contexto (decisiones de esta sesión):**

- El hosting es un **Droplet** (VPS Linux por SSH), no App Platform → no hay auto-deploy; se **clona el repo con git** en el servidor y se actualiza con `git pull`.
- **Objetivo inmediato:** subir a un **link de prueba** (para que el jefe vea el avance), NO abierto al público. Con la sección de **Clientes/Empleado ocultas**.
- **Para que se vean los seguros basta con el backend actual + `seed_catalogo`** — NO se necesitan las tablas de descuentos/club ni las columnas ricas de Corredín (eso es objetivo #1, va después).
- **Corredín para la demo:** se deja **como está** (funciona con el fallback hardcodeado). Pasarlo a BD es trabajo posterior, no bloquea el link de prueba.
- **DigitalOcean es la opción correcta** (full-stack: frontend + FastAPI + MariaDB en un Droplet). Vercel/Netlify solo sirven para frontend → se descartaron.

### Conexión GitHub → Droplet (Deploy Key, una sola vez)

**1. En el Droplet (SSH) — generar la llave:**

```bash
ssh-keygen -t ed25519 -C "droplet-prietocorrea" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub   # copiar TODO lo que imprime
```

**2. En GitHub:** `https://github.com/valenoe/pagina_web_seguros` → **Settings → Deploy keys → Add deploy key** → Title `Droplet`, pegar la key, **Allow write access DESMARCADO** (solo lectura) → Add key.

**3. En el Droplet — que git use esa llave:**

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
```

**4. Clonar (URL SSH, no HTTPS):**

```bash
git clone git@github.com:valenoe/pagina_web_seguros.git
```

**5. Actualizar tras cada push:**

```bash
cd pagina_web_seguros && git pull
```

### ⚠️ Pendientes/avisos antes de subir

1. **Rama:** todo el trabajo (dashboard, chatbot, integración) está en **`integracion-dashboard`**, aún NO en `main`. Al clonar viene `main` (sin eso) → hacer `git checkout integracion-dashboard` en el servidor, o mergear a `main` primero. **Decisión pendiente:** ¿mergear a main antes de subir, o desplegar la rama?
2. **`.env` no viaja por GitHub** (`.gitignore`) → crearlo a mano en el Droplet con datos de producción: `DATABASE_URL` de la MariaDB del servidor, `ALLOWED_ORIGINS` con el dominio real, `SECRET_KEY` nuevo (`secrets.token_hex(32)`).
3. **Sacar `localhost` del frontend (CAMBIO DE CÓDIGO PENDIENTE):** `frontend-web-seguros/src/services/api.js` línea 1 apunta fijo a `http://localhost:8000`. Hay que hacerlo variable de entorno (p. ej. `VITE_API_URL`) apuntando al backend publicado, o el frontend subido no carga nada.
4. **Ocultar Clientes/Empleado (CAMBIO DE CÓDIGO PENDIENTE):** botón "Mi Sucursal" del Header + rutas del portal, para que el link de prueba muestre solo el sitio público.
5. **Falta del lado del Droplet (guía por escribir):** instalar MariaDB + crear BD + cargar `DB.sql`, levantar el backend (uvicorn + nginx/systemd), correr `python -m tests.seed_catalogo`, y servir el `npm run build` del frontend por nginx.

**Plan acordado:** antes de subir, completar lo más posible del código actual; **después del almuerzo** evaluar si se sube. Los dos cambios de código pendientes (puntos 3 y 4) quedan por hacer.
