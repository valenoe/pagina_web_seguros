# Guía de Git para Trabajo en Equipo

> Guía práctica para colaborar con Git sin morir en el intento.  
> Cubre desde clonar el repositorio hasta resolver conflictos como un profesional.

---

## Tabla de Contenidos

1. [Clonar el repositorio (HTTPS)](#1-clonar-el-repositorio-https)
2. [Configuración inicial](#2-configuración-inicial)
3. [Flujo de trabajo con ramas](#3-flujo-de-trabajo-con-ramas)
4. [Actualizar tu rama con los cambios del equipo](#4-actualizar-tu-rama-con-los-cambios-del-equipo)
5. [Subir cambios al repositorio remoto](#5-subir-cambios-al-repositorio-remoto)
6. [Integrar tu trabajo al main (Pull Request)](#6-integrar-tu-trabajo-al-main-pull-request)
7. [Traer archivos NUEVOS desde main (el tema delicado)](#7-traer-archivos-nuevos-desde-main-el-tema-delicado)
8. [Conflictos: qué pasa cuando dos editan el mismo archivo](#8-conflictos-qué-pasa-cuando-dos-editan-el-mismo-archivo)
9. [Guía para el dueño del repositorio](#9-guía-para-el-dueño-del-repositorio)
10. [Comandos de emergencia](#10-comandos-de-emergencia)
11. [Errores comunes y cómo resolverlos](#11-errores-comunes-y-cómo-resolverlos)

---

## 1. Clonar el repositorio (HTTPS)

Clonar es descargar una copia completa del repositorio a tu computador. El método HTTPS no requiere configurar claves SSH, basta con tu usuario y contraseña (o un token).

```bash
git clone https://github.com/usuario/nombre-del-repo.git
```

Esto crea una carpeta con el nombre del repositorio. Entra a ella:

```bash
cd nombre-del-repo
```

### Si el repositorio es privado

GitHub ya no acepta contraseñas directamente. Necesitas un **Personal Access Token (PAT)**:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera uno con permiso `repo`
3. Úsalo como contraseña cuando Git te la pida, o inclúyelo directamente en la URL:

```bash
git clone https://TU_TOKEN@github.com/usuario/nombre-del-repo.git
```

> ⚠️ **Nunca subas una URL con token al repositorio.** Es equivalente a subir tu contraseña.

---

## 2. Configuración inicial

Antes de hacer cualquier cosa, asegúrate de que Git sepa quién eres. Esto aparece en cada commit que hagas:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

Verifica que quedó bien:

```bash
git config --list
```

---

## 3. Flujo de trabajo con ramas

La regla de oro: **nadie trabaja directamente en `main`**. Cada persona trabaja en su propia rama y luego integra su trabajo.

### Crear una rama nueva

```bash
# Primero asegúrate de estar en main y tenerlo actualizado
git checkout main
git pull origin main

# Crea y cámbiate a tu nueva rama en un solo paso
git checkout -b mi-funcionalidad
```

Nombra las ramas de forma descriptiva. Algunos ejemplos útiles:

```
feature/login-usuarios
fix/error-calculo-total
docs/actualizar-readme
```

### Ver en qué rama estás

```bash
git branch
```

La rama activa aparece con un `*` adelante.

### Cambiar entre ramas

```bash
git checkout nombre-de-rama
```

> 💡 Si tienes cambios sin guardar, Git te avisará. Guárdalos con `git stash` antes de cambiar de rama.

---

## 4. Actualizar tu rama con los cambios del equipo

Mientras tú trabajas, tus compañeros también suben cambios. Necesitas traer esos cambios a tu rama regularmente para no quedarte atrás.

### Paso 1: Traer los cambios remotos sin aplicarlos todavía

```bash
git fetch origin
```

Esto descarga la información pero no modifica tu código.

### Paso 2: Actualizar tu rama con los cambios de main

```bash
# Estando en tu rama:
git rebase origin/main
```

O con merge (más simple, genera un commit extra):

```bash
git merge origin/main
```

**¿Cuál usar?**

- `rebase`: historial más limpio, ideal para ramas de trabajo personal. Requiere más cuidado.
- `merge`: más seguro y predecible, deja trazabilidad de qué se unió y cuándo.

Para trabajo en equipo sin mucha experiencia, **merge es más seguro**.

### Flujo completo resumido

```bash
git checkout mi-rama
git fetch origin
git merge origin/main
# Si hay conflictos, resuélvelos (ver sección 8)
```

---

## 5. Subir cambios al repositorio remoto

### El ciclo básico de trabajo

```bash
# 1. Ver qué archivos cambiaste
git status

# 2. Agregar los archivos que quieres guardar
git add nombre-del-archivo.txt

# O agregar TODO lo que cambiaste (con cuidado)
git add .

# 3. Crear el commit con un mensaje descriptivo
git commit -m "Agrega validación de formulario de contacto"

# 4. Subir tu rama al repositorio remoto
git push origin mi-funcionalidad
```

### Cómo escribir buenos mensajes de commit

Un buen commit dice **qué** se hizo y opcionalmente **por qué**, no cómo:

```
✅ "Corrige error en cálculo de descuentos para usuarios premium"
✅ "Agrega botón de exportar a PDF en reportes"
❌ "cambios"
❌ "arreglé cosas"
❌ "wip"
```

### Si es tu primer push de esa rama

```bash
git push -u origin mi-funcionalidad
```

El `-u` establece el "upstream" para que los próximos `git push` funcionen sin especificar la rama.

---

## 6. Integrar tu trabajo al main (Pull Request)

Cuando tu funcionalidad está lista para unirse al código principal, creas un **Pull Request (PR)** desde GitHub (o GitLab, Bitbucket, etc.).

### Pasos

1. Sube tu rama: `git push origin mi-funcionalidad`
2. Ve al repositorio en GitHub
3. Aparecerá un botón **"Compare & pull request"** — haz clic
4. Escribe una descripción clara de lo que hiciste
5. Asigna al dueño del repositorio como revisor
6. Espera revisión y aprobación antes de hacer merge

> El dueño del repositorio es quien aprueba y hace el merge, no tú. Así se evitan errores.

---

## 7. Traer archivos NUEVOS desde main (el tema delicado)

Aquí viene algo importante que mucha gente no entiende bien.

Cuando haces `git merge origin/main` en tu rama, Git trae **todo**: archivos modificados, archivos nuevos y archivos eliminados. No hay una forma nativa de traer solo "los nuevos" sin traer también los cambios en archivos existentes.

### ¿Es bueno o malo traer todo?

**Es bueno** traer todo regularmente porque:

- Evitas conflictos gigantes al final
- Tu código funciona contra la versión real del proyecto
- Reduces el riesgo de integrar algo que ya fue cambiado por otro

**El riesgo** existe si traes cambios de main que entran en conflicto con tu trabajo en progreso. Pero eso es precisamente lo que quieres saber lo antes posible, no el día del merge.

### Si SOLO quieres un archivo específico de main

En casos muy puntuales, puedes traer un solo archivo de otra rama:

```bash
git checkout origin/main -- ruta/al/archivo.txt
```

Esto reemplaza ese archivo en tu rama con la versión de main. Úsalo con cuidado y con conciencia de lo que estás haciendo.

---

## 8. Conflictos: qué pasa cuando dos editan el mismo archivo

Este es el escenario más temido, pero es completamente manejable si sabes qué esperar.

### Cuándo ocurre un conflicto

Dos personas editan la **misma línea** (o líneas cercanas) del **mismo archivo** en ramas distintas, y luego ambas intentan unirse a main.

### Qué ve Git

Cuando intentas hacer merge y hay conflicto, Git modifica el archivo afectado y pone marcadores así:

```
<<<<<<< HEAD (tu rama)
El precio es de $100 con descuento aplicado
=======
El precio base es $120
>>>>>>> origin/main
```

La sección entre `<<<<<<< HEAD` y `=======` es **tu versión**.  
La sección entre `=======` y `>>>>>>>` es **la versión de main**.

### Cómo resolverlo

1. Abre el archivo en tu editor
2. Decide qué versión queda (o combina ambas manualmente)
3. Borra los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
4. Guarda el archivo
5. Marca el conflicto como resuelto:

```bash
git add archivo-con-conflicto.txt
git commit -m "Resuelve conflicto en precios"
```

### Herramientas que facilitan la resolución

VS Code tiene una interfaz visual para conflictos muy cómoda: muestra los cambios en colores y botones para elegir "Accept Current", "Accept Incoming" o "Accept Both".

### ¿Qué pasa si los dos hacen merge a main sin resolver?

Git no deja hacer merge si hay conflicto sin resolver. El segundo en intentarlo verá el conflicto y deberá resolverlo antes de poder integrar. El repositorio no queda roto — Git simplemente detiene el proceso y espera que una persona tome la decisión.

---

## 9. Guía para el dueño del repositorio

Como dueño del repositorio, tu rol es mantener `main` estable y el historial limpio. Aquí van las cosas que solo se aprenden con el tiempo.

### Protege la rama main

En GitHub: Settings → Branches → Add rule → Branch name pattern: `main`

Activa estas opciones:

- **Require a pull request before merging**: nadie puede hacer push directo a main
- **Require approvals**: tú debes aprobar cada PR antes de que se integre
- **Require status checks to pass**: si tienes tests, oblígalos a pasar
- **Do not allow bypassing the above settings**: aplica la regla incluso para administradores

### Cómo revisar un Pull Request correctamente

1. Lee el código, no solo el resultado
2. Fíjate en:
   - ¿Hay lógica duplicada que ya existe en otra parte?
   - ¿Los nombres de variables/funciones son claros?
   - ¿Se manejaron los casos de error?
   - ¿El commit message explica bien qué se hizo?
3. Prueba el código localmente si el cambio es crítico:

```bash
git fetch origin
git checkout nombre-de-la-rama-del-PR
# Prueba lo que necesites
git checkout main
```

### Mantén el historial limpio con Squash Merge

Cuando alguien hace 15 commits de prueba en su rama ("arreglé", "otro fix", "ahora sí"), puedes integrarlos como un solo commit limpio en main:

En GitHub, al hacer merge de un PR, selecciona **"Squash and merge"** en lugar de "Create a merge commit".

Esto convierte todos los commits del PR en uno solo con el mensaje que tú elijas.

### Monitorea el estado del repositorio

```bash
# Ver todas las ramas (locales y remotas)
git branch -a

# Ver qué ramas ya fueron mergeadas a main (candidatas a borrar)
git branch --merged main

# Ver el historial gráfico del repositorio
git log --oneline --graph --all
```

### Limpieza de ramas viejas

Las ramas integradas a main deben borrarse para no acumular basura:

```bash
# Borrar rama remota desde terminal
git push origin --delete nombre-de-rama

# Borrar rama local
git branch -d nombre-de-rama
```

En GitHub también puedes activar el borrado automático de ramas al hacer merge: Settings → General → "Automatically delete head branches".

### Gestión de accesos

- Da acceso de **"Write"** a los colaboradores, no de "Admin"
- El Admin puede cambiar configuraciones y borrar el repositorio — reserva ese nivel para ti
- Revisa los accesos periódicamente en Settings → Collaborators

### Comunicación sobre conflictos entre colaboradores

Cuando dos personas editan el mismo archivo, quien hace el PR **segundo** es quien resuelve el conflicto. Establece esta norma desde el principio para evitar discusiones.

Lo más saludable es que el equipo se coordine antes de editar archivos compartidos y críticos. Si dos personas necesitan editar el mismo archivo, lo ideal es hacerlo secuencialmente, no en paralelo.

---

## 10. Comandos de emergencia

### Deshacer el último commit (sin perder los cambios)

```bash
git reset --soft HEAD~1
```

### Deshacer cambios en un archivo antes de hacer commit

```bash
git checkout -- nombre-del-archivo.txt
# O en versiones modernas de Git:
git restore nombre-del-archivo.txt
```

### Guardar cambios temporalmente sin hacer commit (stash)

Útil cuando necesitas cambiar de rama pero tienes trabajo a medias:

```bash
# Guardar
git stash

# Recuperar
git stash pop
```

### Revertir un commit que ya subiste a main

No lo borres — créa un commit que lo deshace:

```bash
git revert abc1234   # reemplaza abc1234 por el hash del commit
git push origin main
```

Esto es seguro porque no reescribe el historial, solo agrega un nuevo commit que deshace los cambios.

### Ver el historial y encontrar un commit específico

```bash
git log --oneline
```

---

## 11. Errores comunes y cómo resolverlos

### "rejected — non-fast-forward"

```
! [rejected] main -> main (non-fast-forward)
```

**Qué pasó:** Alguien más subió cambios antes que tú y tu versión local está atrás.

**Solución:**

```bash
git pull origin main
# Resuelve conflictos si los hay
git push origin main
```

### "Your local changes would be overwritten by merge"

Git se niega a hacer merge porque tienes cambios sin guardar.

**Solución:**

```bash
git stash
git merge origin/main
git stash pop
```

### Subiste algo que no debías (contraseña, archivo grande, etc.)

Si aún no hiciste push:

```bash
git reset --soft HEAD~1
# Corrige el problema
git commit -m "Mensaje correcto"
```

Si ya hiciste push, necesitas reescribir el historial. Esto es delicado y afecta a todo el equipo — habla con el dueño del repositorio antes de hacer cualquier cosa.

### Borraste una rama por accidente

Si todavía tienes el hash del último commit de esa rama:

```bash
git checkout -b rama-recuperada abc1234
```

Puedes encontrar el hash con:

```bash
git reflog
```

`reflog` es como un historial de todo lo que Git hizo en tu máquina, incluyendo ramas borradas. Te salva la vida.

---

## Resumen del flujo diario

```
1. git checkout main
2. git pull origin main
3. git checkout -b mi-tarea
4. [trabajar, trabajar, trabajar]
5. git add .
6. git commit -m "Descripción clara de lo que hice"
7. git fetch origin && git merge origin/main   ← hacer esto frecuentemente
8. git push origin mi-tarea
9. Crear Pull Request en GitHub
10. Esperar revisión y aprobación
```

---

*Esta guía cubre los casos más comunes. Git tiene mucha profundidad — con el tiempo descubrirás comandos y situaciones nuevas. Lo importante es entender el flujo y no entrar en pánico cuando algo sale mal: Git casi siempre tiene una salida.*
