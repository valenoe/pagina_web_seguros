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

| Archivo        | Ruta                                         |
| -------------- | -------------------------------------------- |
| ~~App.css~~    | ~~`frontend-web-seguros/src/App.css`~~ ✅ vacío, eliminable |
| Entrada global | `frontend-web-seguros/src/styles/global.css` |
| Importado en   | `frontend-web-seguros/src/App.jsx` (línea 1) |

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

| Prioridad | Archivo                  | Problema principal                                                                                                          |
| --------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| ✅ Hecho  | `Nosotros.css`           | ~~`.historia-card` 420px fijos; grid sin colapso; sin ≤700px~~ → resuelto con `clamp()`, `aspect-ratio` y breakpoint ≤700px |
| ✅ Hecho  | `DetalleSeguro.css`      | ~~Sin media queries propias~~ → breakpoints 1000px + 700px añadidos (movidos desde `PortalDashboard.css`)                   |
| ✅ Hecho  | `PerfilCliente.css`      | ~~Sin media queries propias~~ → breakpoints 1000px + 700px añadidos (movidos desde `PortalDashboard.css`)                   |
| ✅ Hecho  | `LoginClientes.css`      | ~~Sin ≤700px; card apretada; `h1` fijo~~ → `clamp()` en tipografía/padding, breakpoint ≤700px (padding página) y ≤450px (apila los checkboxes de `login-options`) |
| ✅ Hecho  | `RegistroOnboarding.css` | ~~Padding y `h1` sin ajuste en ≤700px~~ → breakpoints 1000px + 700px añadidos                                               |
| ✅ Hecho  | `Testimonials.css`       | ~~Swiper global sin scope; duplicación con `Home.css`; sin ≤700px~~ → reescrito como única fuente (con `var()`, swiper scopeado, fade-in `.visible`), `clamp()` en tipografía/padding, breakpoints 900px + 700px. Bloque duplicado eliminado de `Home.css`. |
| ✅ Hecho  | `Legal.css`              | ~~Sin breakpoint ≤700px~~ → `clamp()` en padding página/hero/documento y en `h1`/`h2`; breakpoint ≤700px (radios + caja de contacto). El 980px quedó solo con el colapso de grid e índice. |
| 🟡 Media  | `Clientes.css`           | **← PRÓXIMO.** Sin breakpoint ≤1000px intermedio para el grid                                                               |
| 🟢 Baja   | `Seguros.css`            | Hero con `height: 420px` fija sin ajuste                                                                                    |
| 🟢 Baja   | `Cotizador.css`          | `height: calc(100vh - 95px)` en pantalla de éxito se corta con teclado virtual                                              |
| ✅ OK     | `Header.css`             | Breakpoints 1300px, 1100px, 1000px — bien cubierto                                                                          |
| ✅ OK     | `Footer.css`             | Breakpoints 1000px, 700px — bien cubierto                                                                                   |
| ✅ OK     | `Home.css`               | Breakpoints 1100px, 1000px, 700px — el mejor cubierto del proyecto                                                          |
| ✅ OK     | `Contacto.css`           | Layout single-column aguanta bien; bajo riesgo                                                                              |
| ✅ OK     | `Cotizador.css`          | Breakpoints 1000px, 800px, 700px — bien cubierto (salvo el caso de éxito)                                                   |

**Nota sobre `PortalDashboard.css`:** Tenía 2 428 líneas y albergaba los breakpoints de `DetalleSeguro` y `PerfilCliente`. ✅ Esos breakpoints ya se movieron a sus propios CSS y se eliminaron de `PortalDashboard.css` (ya no quedan selectores `detalle-seguro`/`perfil-cliente` ahí).

### Orden de trabajo (responsividad)

1. ✅ `Nosotros.css` — hecho
2. ✅ `DetalleSeguro.css` + `PerfilCliente.css` — hecho (breakpoints movidos desde `PortalDashboard.css`)
3. ✅ `LoginClientes.css` — hecho
4. ✅ `RegistroOnboarding.css` — hecho
5. ✅ `Testimonials.css` — hecho (única fuente; duplicación eliminada de `Home.css`)
6. ✅ `Legal.css` — hecho (`clamp()` + breakpoint ≤700px movido a 700px; índice encoge con `clamp()`; `min-width:0`+`overflow-wrap` para que el grid baje; `scroll-margin-top:115px` en secciones por el header fijo; padding vertical reducido)
7. ⏭️ `Clientes.css` — **OMITIDO.** La ruta `/clientes` (hub de tarjetas) quedó deshabilitada (comentada en `Router.jsx`, import incluido) porque el botón "Mi Sucursal" del header ya da acceso a Ejecutivo Comercial y a Clientes. La página `Clientes.jsx`/`Clientes.css` siguen en el repo pero sin ruta. No requiere responsividad.
8. 🟢 `Seguros.css` — **← PRÓXIMO A EDITAR**
9. 🟢 `Cotizador.css`

> **Nota:** todo el trabajo de responsividad listado como ✅ está en el working tree **sin commitear**.
>
> **Pendiente menor (Legal):** revisar el espaciado vertical entre textos del documento (`line-height`/`margin` de `p`, `li`, `h2`) — quedó para después.

---

## ✅ Resuelto — `Testimonials.css` (paso 5, hecho)

Ya ejecutado el plan de abajo: `Testimonials.css` es ahora la única fuente y el bloque duplicado se eliminó de `Home.css` (incluidas sus reglas en el `@media 700px`). Se conservaron `.testimonios.visible` + `opacity:0` en Testimonials, así que el fade-in del observer sigue funcionando. Pendiente: verificar en navegador y commitear. Hallazgos originales (referencia):

### Contexto
`<Testimonials />` se renderiza **solo dentro de `Home.jsx`** (línea 21). Por eso en Home se cargan a la vez `Home.css` y `Testimonials.css`, y **ambos definen las mismas clases** (`.testimonios`, `.testimonial-card`, `.quote`, `.cliente`, swiper…). Es duplicación casi total con cascada frágil (gana el que el bundle importe último).

### La copia de `Home.css` (líneas 434–567 + reglas en su `@media 700px`) es la "buena"; la de `Testimonials.css` está peor:

| Aspecto | `Home.css` (mejor) | `Testimonials.css` (peor) |
| --- | --- | --- |
| Fade-in al scroll | ✅ `opacity:0` + `.testimonios.visible` | ❌ **falta** — sin esto la animación del `IntersectionObserver` del JSX no existiría |
| Selectores Swiper | ✅ scopeados: `.testimonios .swiper-button-prev` | ❌ **globales**: `.swiper-button-prev` → se filtran a cualquier otro Swiper del sitio |
| Colores | ✅ `var(--pc-blue/orange)` | ❌ hardcodeados `#07195a` / `#f47c20` |
| `h2` font-weight | 800 | 700 |
| Breakpoint | 700px | 900px |

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
