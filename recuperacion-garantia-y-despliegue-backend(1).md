# Recuperación droplet garantía + Despliegue backend de prueba

**Fecha:** 04-07-2026
**Autora:** Valery

---

# PARTE 1 — Recuperación del droplet "garantia" (64.227.97.159)

## Síntomas iniciales

- CyberPanel daba **503** en `http://64.227.97.159:8090`
- Imposible entrar por SSH, Web Console o Recovery Console ("All configured authentication methods failed")
- Cristian reportó que "algo dejó de funcionar" — los sitios servidos (`sistema.prietocorreaseguros.cl`) seguían funcionando
- El cambio forzado de contraseña (tras Reset Root Password) se completaba pero **no persistía**

## Diagnóstico

Pista definitiva al intentar cambiar la contraseña por SSH:

```
sh: 1: cannot create /tmp/wttwe2: No space left on device
```

Pero el disco tenía espacio (`77% usado, 18G libres`). El agotado era otro recurso: **inodos** (límite de cantidad de archivos del disco, independiente de los GB).

```
df -i  →  /dev/vda1: 10.354.688 inodos, 10.354.635 usados, 53 libres (100%)
```

Con inodos al 100%, el sistema no puede crear NINGÚN archivo nuevo: fallan los cambios de contraseña (archivos temporales), CyberPanel (503), y a futuro habría fallado la renovación del certificado SSL.

**Culpable localizado:**

```
/var/spool/postfix/maildrop → 10.043.717 archivos
```

La cola de correo local de Postfix acumuló ~10 millones de correos sin procesar durante meses (97% de los inodos del disco).

## Procedimiento de recuperación (Recovery ISO de DigitalOcean)

1. **Panel DO → droplet → Settings → Recovery Mode → "Boot from Recovery ISO"** → Save
2. **Turn Off** → **ON** (arranca el entorno de rescate; los sitios quedan caídos durante toda la maniobra)
3. **Settings → Recovery Console → Launch** → aparece el menú del recovery
4. Opción **1 — Mount your Disk Image** (monta el disco del droplet en `/mnt`)
5. Opción **4 — Configure Keyboard** si el teclado da problemas con `/` (modelo 72 = Generic 105-key, layout Spanish Latin American) — aunque el copy/paste con Ctrl+Shift+V resultó más confiable
6. Opción **6 — Interactive Shell** para el diagnóstico:

```bash
df -h /mnt                                        # espacio: OK (77%)
df -i /mnt                                        # inodos: 100% ← problema
find /mnt/var/spool -xdev 2>/dev/null | wc -l     # 10.044.158 archivos
du --inodes /mnt/var/spool 2>/dev/null | sort -rn | head -15   # culpable: postfix/maildrop
```

7. **Limpieza** (borra SOLO la cola de correo atascado; no toca correos entregados, buzones, sistema ni base de datos):

```bash
cd /mnt/var/spool/postfix
find maildrop -type f -delete     # demora, silencio total es normal
df -i /mnt                        # verificar: inodos de 100% → 4%
```

Resultado: **10 millones de inodos y ~38 GB liberados** (disco pasó de 59G a 21G usados).

8. Opción **2 — Check Filesystem** (fsck): chequeo/optimización del disco tras la limpieza masiva. Salió limpio. *(Ojo: el fsck desmonta el disco — volver a montarlo con la opción 1 antes del paso siguiente.)*
9. Opción **3 — Reset Droplet Root Password** → fijar la contraseña nueva (ahora sí persiste, con inodos disponibles)
10. **Settings → Recovery Mode → "Boot from Hard Drive"** → Save → **Turn Off** → **ON**
11. Verificaciones: sitios arriba, SSH/Web Console con la contraseña nueva funcionando

### Nota sobre el warning de SSH

Al conectar mientras el droplet está en recovery (o tras el ciclo), puede salir `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED`. Es esperado (el recovery es otro sistema con otra huella). Se limpia con:

```powershell
ssh-keygen -R 64.227.97.159
```

## Pendientes del droplet garantía

- [ ] **CRÍTICO: identificar qué genera tantos correos** (formulario, cron o notificación mal configurada). Si no se corrige la causa, la cola se vuelve a llenar en meses. Revisar logs de Postfix y crons.
- [ ] **CPU al 93% / load 28 al arrancar** — identificar el proceso (`top`), posiblemente relacionado con lo anterior
- [ ] Monitorear la cola periódicamente: `ls /var/spool/postfix/maildrop | wc -l`
- [ ] Revisar por qué CyberPanel daba 503 (probablemente resuelto con la limpieza + reinicio; verificar `:8090`)
- [ ] 249 updates pendientes (77 de seguridad) + kernel — coordinar con Cristian
- [ ] Guardar la contraseña root nueva en un lugar compartido del equipo
- [ ] Considerar deshabilitar o restringir Postfix si el servidor no necesita enviar correo

---

# PARTE 2 — Despliegue del backend FastAPI (droplet WordPress, 146.190.123.129)

## Decisión de arquitectura

El backend se desplegó en el **mismo droplet del frontend** (WordPress) y no en el garantía, porque: el garantía es producción de otro sistema, lo administra CyberPanel (choca con servicios manuales), y recién salía de una crisis. En el droplet WordPress ya estaba el repo clonado y el vhost funcionando.

Patrón elegido: **uvicorn local (127.0.0.1:8000) + Apache ProxyPass /api** → mismo dominio para frontend y API = **sin CORS ni rebuild** (el frontend usa `VITE_API_URL ?? "/api"`).

## Pasos ejecutados

### 1. Entorno Python

```bash
cd /var/www/pagina_web_seguros
sudo apt install -y python3-venv python3-pip
python3 -m venv entorno_web_seguros
source entorno_web_seguros/bin/activate
pip install -r requirements.txt
```

### 2. Base de datos (MySQL del droplet, credenciales root en /root/.digitalocean_password)

```sql
CREATE DATABASE seguros_web_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'seguros_user'@'localhost' IDENTIFIED BY '********';
GRANT ALL PRIVILEGES ON seguros_web_db.* TO 'seguros_user'@'localhost';
FLUSH PRIVILEGES;
```

```bash
mysql -u seguros_user -p seguros_web_db < DB.sql
```

Nota: el servidor usa **MySQL** (no MariaDB como en local); transparente para SQLAlchemy/PyMySQL.

### 3. `.env` del backend (`backend-web-seguros/.env`)

- `DATABASE_URL=mysql+pymysql://seguros_user:****@localhost:3306/seguros_web_db`
- `SECRET_KEY` → generar una propia de producción: `openssl rand -hex 32`
- `ALLOWED_ORIGINS` → agregar `http://web.prietocorreaseguros.cl` (redundante con ProxyPass, pero no daña)
- `LINK_SISTEMA_EXTERNO` → sin cambios (es el link al login del sistema interno de garantías)

### 4. Prueba manual

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 &
curl http://127.0.0.1:8000/docs      # → 200 OK, Swagger UI
kill %1
```

### 5. Servicio systemd — `/etc/systemd/system/backend-seguros.service`

```ini
[Unit]
Description=Backend FastAPI Prieto Correa Seguros
After=network.target mysql.service

[Service]
User=root
WorkingDirectory=/var/www/pagina_web_seguros/backend-web-seguros
ExecStart=/var/www/pagina_web_seguros/entorno_web_seguros/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now backend-seguros
```

### 6. ProxyPass + protección del API en Apache

Vhost final — `/etc/apache2/sites-available/web-seguros.conf`:

```apache
<VirtualHost *:80>
    ServerName web.prietocorreaseguros.cl
    DocumentRoot /var/www/pagina_web_seguros/frontend-web-seguros/dist

    <Directory /var/www/pagina_web_seguros/frontend-web-seguros/dist>
        Options -Indexes
        AllowOverride All
        AuthType Basic
        AuthName "Sitio en pruebas"
        AuthUserFile /etc/apache2/.htpasswd-webseguros
        Require valid-user
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8000
    ProxyPassReverse /api http://127.0.0.1:8000

    <Location /api>
        SetEnvIf Authorization "^Bearer" es_peticion_jwt
        AuthType Basic
        AuthName "Sitio en pruebas"
        AuthUserFile /etc/apache2/.htpasswd-webseguros
        <RequireAny>
            Require env es_peticion_jwt
            Require valid-user
        </RequireAny>
    </Location>
</VirtualHost>
```

```bash
sudo a2enmod proxy proxy_http rewrite
sudo apachectl configtest && sudo systemctl reload apache2
```

## Bug encontrado y su solución (importante entenderlo)

**Síntoma:** registro OK, login OK (200 en logs), pero el portal devolvía 401 en `/api/portal/*`.

**Causa:** el basic auth de Apache y el JWT del backend **usan la misma cabecera `Authorization`**. Al entrar al portal, el frontend la reemplaza con `Bearer <token>` → Apache deja de ver las credenciales Basic → rechaza con 401 antes de llegar al backend.

**Solución:** el bloque `<Location /api>` con `SetEnvIf + RequireAny` del vhost de arriba: deja pasar peticiones con cabecera `Bearer` (el backend valida el JWT de verdad) y exige usuario/clave a todo lo demás. Un `Bearer` falso pasa Apache pero el backend lo rechaza; la barrera cumple su rol de ocultar el API de scanners y curiosos.

## Verificación final

```bash
curl http://web.prietocorreaseguros.cl/api/seguros/            # → 401 (barrera activa)
curl -u usuario:clave http://web.prietocorreaseguros.cl/api/docs   # → Swagger
```

Y en el navegador: registro de cliente ✅, login ✅, portal con datos ✅. Registro verificado en la base (`select * from web_clientes`).

## HTTPS con Certbot (agregado 05-07-2026)

**Problema detectado:** desde celulares, `web.prietocorreaseguros.cl` redirigía sola a `prietocorreaseguros.cl`. Causa: los navegadores móviles modernos usan HTTPS-First (intentan `https://` siempre, sin probar HTTP). Como el subdominio solo existía en el puerto 80, la petición HTTPS caía al vhost por defecto (WordPress), que redirige al dominio principal. Conclusión: el staging necesita HTTPS para ser visible desde móviles.

**Solución** (Certbot ya venía preinstalado en el droplet WordPress):

```bash
sudo certbot --apache -d web.prietocorreaseguros.cl
```

Resultado:
- Certificado Let's Encrypt emitido, expira **06-10-2026**, con **renovación automática** programada por Certbot
- Vhost SSL generado automáticamente: `/etc/apache2/sites-available/web-seguros-le-ssl.conf` (copia la config del vhost original: basic auth, ProxyPass y bloque Bearer incluidos)
- Redirección HTTP→HTTPS agregada al vhost del puerto 80
- La validación pasó sin conflicto con el basic auth (no hizo falta la excepción para `/.well-known/acme-challenge`; si en el futuro una renovación fallara con "challenge failed", agregar al vhost :80: `<Location /.well-known/acme-challenge> Require all granted </Location>` y reintentar)

**Verificado:** sitio accesible desde celulares en `https://web.prietocorreaseguros.cl` con candado; login del portal ya no muestra advertencia de página insegura; flujo completo (registro/login/portal) funcionando por HTTPS.

## Diagnóstico útil (comandos de referencia)

```bash
sudo systemctl status backend-seguros              # estado del servicio
sudo journalctl -u backend-seguros -n 50 --no-pager   # logs del backend (peticiones y errores)
sudo systemctl restart backend-seguros             # reiniciar tras cambios de código/.env
```

## Cómo actualizar el despliegue

```bash
cd /var/www/pagina_web_seguros
git pull
# Frontend:
cd frontend-web-seguros && npm run build           # Apache sirve el nuevo dist al tiro
# Backend:
sudo systemctl restart backend-seguros             # si cambió código Python o el .env
# Si cambió el schema de la BD: aplicar la migración/SQL correspondiente antes del restart
```

## Pendientes del despliegue

- [x] ~~HTTPS con Certbot para `web.prietocorreaseguros.cl`~~ ✅ hecho el 05-07 (ver sección HTTPS)
- [ ] Endurecer: clave del basic auth más fuerte, `User=` sin privilegios en el systemd, MySQL amarrado a 127.0.0.1
- [ ] Avisar a Cristian: vhost + servicio backend agregados en el droplet WordPress
- [ ] Al pasar a producción real: quitar basic auth, dominio definitivo, HTTPS obligatorio
