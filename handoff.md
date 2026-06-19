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

**Progreso actual (sin commitear):** ya están corregidos `Nosotros.css`, `DetalleSeguro.css`, `PerfilCliente.css` y `RegistroOnboarding.css`. Los breakpoints de `DetalleSeguro` y `PerfilCliente` ya se movieron desde `PortalDashboard.css` (ya no quedan ahí). **Próximo a editar: `LoginClientes.css`.**

### Criterios de corrección

- **`clamp()`** para valores que escalan suavemente: tipografía (`font-size`), padding, gap. Evita múltiples breakpoints solo para reducir tamaños.
- **`@media`** para cambios de layout: columnas que colapsan, elementos que se ocultan, `flex-direction` que cambia.
- Breakpoints objetivo: `≤1000px` (tablet), `≤700px` (móvil).

### Diagnóstico por archivo

| Prioridad | Archivo                  | Problema principal                                                                                                          |
| --------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 🔴 Alta   | `Nosotros.css`           | `.historia-card` con `width/height: 420px` fijos; grid de valores con `repeat(4, 420px)` sin colapso; sin breakpoint ≤700px |
| 🔴 Alta   | `DetalleSeguro.css`      | Sin media queries propias; breakpoints viven en `PortalDashboard.css`                                                       |
| 🔴 Alta   | `PerfilCliente.css`      | Sin media queries propias; breakpoints viven en `PortalDashboard.css`                                                       |
| 🟡 Media  | `LoginClientes.css`      | Sin breakpoint ≤700px; card apretada en 375px; `h1` nunca se reduce bajo 1000px                                             |
| 🟡 Media  | `RegistroOnboarding.css` | Padding y `h1` sin ajuste en ≤700px; `min-height: 650px` fija                                                               |
| 🟡 Media  | `Testimonials.css`       | Selectores Swiper globales sin scope; duplicación con `Home.css`; sin ≤700px propio                                         |
| 🟡 Media  | `Legal.css`              | Sin breakpoint ≤700px                                                                                                       |
| 🟡 Media  | `Clientes.css`           | Sin breakpoint ≤1000px intermedio para el grid                                                                              |
| 🟢 Baja   | `Seguros.css`            | Hero con `height: 420px` fija sin ajuste                                                                                    |
| 🟢 Baja   | `Cotizador.css`          | `height: calc(100vh - 95px)` en pantalla de éxito se corta con teclado virtual                                              |
| ✅ OK     | `Header.css`             | Breakpoints 1300px, 1100px, 1000px — bien cubierto                                                                          |
| ✅ OK     | `Footer.css`             | Breakpoints 1000px, 700px — bien cubierto                                                                                   |
| ✅ OK     | `Home.css`               | Breakpoints 1100px, 1000px, 700px — el mejor cubierto del proyecto                                                          |
| ✅ OK     | `Contacto.css`           | Layout single-column aguanta bien; bajo riesgo                                                                              |
| ✅ OK     | `Cotizador.css`          | Breakpoints 1000px, 800px, 700px — bien cubierto (salvo el caso de éxito)                                                   |

**Nota sobre `PortalDashboard.css`:** Tiene 2 428 líneas y alberga breakpoints de `DetalleSeguro` y `PerfilCliente`. Requiere revisión separada por tamaño. Al corregir esos dos archivos, sus breakpoints deben migrar a sus propios CSS y eliminarse de `PortalDashboard.css`.

### Orden de trabajo (responsividad)

1. 🔴 `Nosotros.css` — **próximo a editar**
2. 🔴 `DetalleSeguro.css` + `PerfilCliente.css` (mover breakpoints desde `PortalDashboard.css`)
3. 🟡 `LoginClientes.css`
4. 🟡 `RegistroOnboarding.css`
5. 🟡 `Testimonials.css` (incluye limpieza de duplicación con `Home.css`)
6. 🟡 `Legal.css`
7. 🟡 `Clientes.css`
8. 🟢 `Seguros.css`
9. 🟢 `Cotizador.css`

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
