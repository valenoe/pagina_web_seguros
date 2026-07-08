# Despliegue frontend de prueba — web.prietocorreaseguros.cl

**Fecha:** 03-07-2026
**Droplet:** `wordpress-pc` (146.190.123.129) — mismo droplet donde corre WordPress de producción
**Estado:** ✅ Funcionando con acceso privado (basic auth)

---

## Qué se hizo

1. **Instalado en el droplet:** Node.js 22 + npm (vía NodeSource).
2. **Repo clonado:** `https://github.com/valenoe/pagina_web_seguros.git` en `/var/www/pagina_web_seguros` (branch `main`).
3. **Build del frontend:** `npm install` + `npm run build` en `frontend-web-seguros/` → genera `dist/`.
4. **Nginx instalado por error y deshabilitado:** se instaló pero no puede usar el puerto 80 (lo ocupa Apache/WordPress). Se deshabilitó con `systemctl disable nginx`. WordPress **no fue tocado**.
5. **Vhost de Apache creado:** `/etc/apache2/sites-available/web-seguros.conf`
   - Sirve `dist/` en el subdominio `web.prietocorreaseguros.cl`
   - Basic auth (usuario/contraseña) para que solo gente con credenciales lo vea
   - Fallback a `index.html` para React Router (mod_rewrite)
6. **Contraseña de acceso:** archivo `/etc/apache2/.htpasswd-webseguros`, usuario `prueba`.
7. **DNS:** registro A en DigitalOcean: `web` → `146.190.123.129`.

## URLs y accesos

- **Link de prueba:** http://web.prietocorreaseguros.cl (pide usuario/contraseña)
- WordPress producción: intacto en `prietocorreaseguros.cl`

## Detalle técnico clave

- El frontend usa `API_URL = import.meta.env.VITE_API_URL ?? "/api"` (`src/services/api.js`).
  - Sin `VITE_API_URL` definido, llama a `/api` en el mismo dominio.
  - **Implicancia:** cuando el backend esté en otro droplet, hay que **rebuildeaar con `VITE_API_URL` apuntando al backend** (ej. `https://api.prietocorreaseguros.cl`) **y configurar CORS** en FastAPI para permitir el origen `web.prietocorreaseguros.cl`. Alternativa: `ProxyPass /api` en Apache hacia el otro droplet (sin rebuild ni CORS).

## Pendientes

- [ ] Desplegar backend (FastAPI + MariaDB) en el otro droplet
- [ ] Definir estrategia de conexión frontend↔backend (rebuild con `VITE_API_URL` + CORS, o ProxyPass)
- [ ] HTTPS con Certbot (ya preinstalado en el droplet) para `web.prietocorreaseguros.cl`
- [ ] Avisar a Cristian del vhost agregado
- [ ] (Opcional) Desinstalar Nginx del droplet WordPress: `sudo apt remove nginx nginx-common`

## Cómo actualizar el frontend de prueba

```bash
cd /var/www/pagina_web_seguros
git pull
cd frontend-web-seguros
npm run build
```

(No requiere reiniciar Apache; sirve archivos estáticos directamente.)

## Cómo revertir todo

```bash
sudo a2dissite web-seguros.conf
sudo systemctl reload apache2
sudo rm /etc/apache2/sites-available/web-seguros.conf /etc/apache2/.htpasswd-webseguros
```

Y borrar el registro DNS `web` en DigitalOcean.

## Observaciones de seguridad

- En los logs de Apache aparecen intentos de login fallidos a WordPress cada ~18 min desde `167.71.74.12` (bot). Avisar a Cristian para bloquear con fail2ban/UFW.
- El droplet tiene un kernel pendiente de actualización (requiere reboot) y 68 updates disponibles — coordinar con Cristian, no reiniciar por cuenta propia.
