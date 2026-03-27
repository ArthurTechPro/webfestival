# Servicio de Correo — Mailcow

Servidor de correo multi-dominio basado en Mailcow Dockerized.

## Instalación en el servidor

```bash
# 1. Clonar mailcow
cd /opt
git clone https://github.com/mailcow/mailcow-dockerized servicio-mail
cd servicio-mail

# 2. Generar configuración
./generate_config.sh
# Cuando pregunte el hostname: mail.webfestival.art
# Timezone: America/Bogota

# 3. Levantar
docker compose pull
docker compose up -d
```

## Acceso al panel

- URL: https://mail.webfestival.art
- Usuario: admin
- Password: moohoo (cambiar inmediatamente)

## Agregar dominio webfestival.art

1. Entrar al panel → Mail Setup → Domains → Add domain
2. Agregar `webfestival.art`
3. Crear buzón: `noreply@webfestival.art`
4. Copiar registros DKIM desde el panel → agregar en Namecheap

## DNS requerido por dominio

| Type  | Host              | Value                              |
|-------|-------------------|------------------------------------|
| A     | mail              | 187.124.232.152                    |
| MX    | @                 | mail.webfestival.art (priority 10) |
| TXT   | @                 | v=spf1 mx ~all                     |
| TXT   | _dmarc            | v=DMARC1; p=quarantine; rua=mailto:admin@webfestival.art |
| TXT   | mail._domainkey   | (obtener desde panel mailcow)      |
| CNAME | autodiscover      | mail.webfestival.art               |
| CNAME | autoconfig        | mail.webfestival.art               |

## Conectar webfestival-api

En `/opt/webfestival/.env`:

```
EMAIL_SERVICE=smtp
SMTP_HOST=mail.webfestival.art
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@webfestival.art
SMTP_PASSWORD=TU_PASSWORD_NOREPLY
SMTP_FROM_EMAIL=noreply@webfestival.art
```

## Agregar nuevo dominio de cliente

1. Panel → Mail Setup → Domains → Add domain
2. Agregar el dominio del cliente
3. Crear buzones para ese dominio
4. Dar al cliente los registros DNS a configurar
5. Copiar DKIM desde el panel y agregar en el DNS del cliente
