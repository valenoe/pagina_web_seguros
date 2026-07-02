# Handoff — Migración CSS (App.css → archivos separados)

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

### ✅ Hecho en esta sesión (rama `integracion-dashboard`, sin commitear)

- Traídos los archivos del dashboard + chatbot + imágenes de `public/`.
- **Fix de estilos del dashboard:** sus 3 páginas (`Dashboard.jsx`, `DetalleSeguro.jsx`, `PerfilClientes.jsx`) **no importaban ningún CSS** (dependían del `App.css` global de él). Se les agregó el import correcto: `PortalDashboard.css`, `DetalleSeguro.css`, `PerfilCliente.css` respectivamente. `PortalDashboard.css` ya cubre ~80% de las clases (65/81); el usuario copió a mano las que faltaban (modal de beneficios `pc-beneficio-modal-*`).
- **El build pasa sin errores** (`npm run build`) → `services/api.js` de main ya tiene las funciones que usa el `Dashboard.jsx` de Matías. **No** hizo falta merge de api.js.

### ✅ Hecho — sesión 2026-06-24 (sin commitear)

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

   | Vista                            | Dato                                                       | Fuente                              | Estado                                                                                                                                        |
   | -------------------------------- | ---------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
   | Club (`beneficios`)              | lista de beneficios                                        | **broker** `/portal/mis-beneficios` | ⛔ NO EXISTE AÚN — hoy `beneficios` llega vacío y cae al fallback `BENEFICIOS_DEMO` (Kimagen, AB Kineintegral) dentro de `ClubBeneficios.jsx` |
   | Club (`beneficios`)              | nombre + RUT del cliente (comprobante)                     | mi-backend (`getMiCuenta`)          | ✅ existe — se pasa por props `nombreVisible` / `rut`                                                                                         |
   | Reportar Siniestro (`siniestro`) | listado de siniestros existentes                           | **broker** `/portal/mis-siniestros` | ⛔ NO EXISTE AÚN — el arreglo interno arranca vacío a propósito (no inventar casos)                                                           |
   | Reportar Siniestro (`siniestro`) | pólizas reportables (para elegir cuál)                     | **broker** (`polizas`)              | ⚠️ hoy puede venir vacío; se pasa por prop `polizas`                                                                                          |
   | Reportar Siniestro (`siniestro`) | autocompletar formulario (nombre/RUT/correo/tel/dirección) | mi-backend (`getMiCuenta`)          | ✅ existe — props `datosPerfil` / `nombreCliente`                                                                                             |
   | Reportar Siniestro (`siniestro`) | envío del reporte                                          | —                                   | 🛠️ hoy genera **PDF/HTML local** (descarga + correo manual); falta endpoint real de envío                                                     |
   | Mis Seguros — Coberturas         | coberturas del cliente                                     | **broker**                          | ⚠️ vacío → cae a fallback derivado de las pólizas                                                                                             |
   | Mis Seguros — Beneficiarios      | beneficiarios por póliza                                   | **broker**                          | ⛔ NO EXISTE AÚN — hoy vacío                                                                                                                  |
   | Mis Seguros — Documentos         | documentos del cliente                                     | **broker**                          | ⚠️ vacío → cae a fallback derivado de las pólizas; el visor de PDF se borró con la vista muerta (reconectar)                                  |

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
