
# Migrar a Google Drive desde Immish

migrar los medios a Google Drive las fotos aparezcan organizadas por nombre de álbum, no con los UUIDs de Immich.

Para eso la herramienta correcta es immich-go — una utilidad que se conecta a la API de Immich, lee los álbumes con sus nombres reales, y los exporta/sincroniza a Google Drive con la estructura legible.

El flujo sería:
Immich (UUIDs internos)  →  immich-go  →  Google Drive
                                          /webfestival-medios/
                                            /Concurso Fotografía 2025/
                                              foto1.jpg
                                              foto2.jpg
                                            /Concurso Video 2025/
                                              video1.mp4
Pasos en el VPS
1. Instalar immich-go:

# Descargar la última versión
curl -L https://github.com/simulot/immich-go/releases/latest/download/immich-go_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin

immich-go --version
2. Instalar y configurar rclone con Google Drive:

curl https://rclone.org/install.sh | sudo bash
rclone config
# → nuevo remote llamado "gdrive" → Google Drive → autorizar con tu cuenta
3. Crear el script de exportación por álbumes:

mkdir -p /opt/scripts

cat > /opt/scripts/export-albums-gdrive.sh << 'EOF'
#!/bin/bash
IMMICH_URL="http://localhost:2283"
IMMICH_KEY="tu-api-key-de-immich"
EXPORT_DIR="/tmp/immich-export"
GDRIVE_DEST="gdrive:webfestival-medios"

# Limpiar exportación anterior
rm -rf $EXPORT_DIR
mkdir -p $EXPORT_DIR

# Exportar álbumes desde Immich con estructura de carpetas
immich-go \
  --server=$IMMICH_URL \
  --api-key=$IMMICH_KEY \
  export \
  --create-album-folder \
  --destination=$EXPORT_DIR

# Sincronizar con Google Drive
rclone sync $EXPORT_DIR $GDRIVE_DEST \
  --log-file=/var/log/rclone-albums.log \
  --log-level INFO \
  --transfers 4

echo "✅ Sincronización completada: $(date)"
EOF

chmod +x /opt/scripts/export-albums-gdrive.sh
4. Obtener tu API key de Immich:

Entra a https://medios.webfestival.art
Ve a Account Settings → API Keys → Create new key
Copia la key y ponla en el script donde dice tu-api-key-de-immich
5. Correr la primera vez manualmente:

/opt/scripts/export-albums-gdrive.sh
6. Programar ejecución automática (ej. cada noche a las 2am):

crontab -e
# Agregar:
0 2 * * * /opt/scripts/export-albums-gdrive.sh
Resultado en Google Drive
webfestival-medios/
  Concurso Fotografía Naturaleza 2025/
    imagen_001.jpg
    imagen_002.jpg
  Concurso Video Corto 2025/
    video_001.mp4
  Sin álbum/
    ...
La clave es --create-album-folder que le dice a immich-go que organice por nombre de álbum en lugar de por fecha o UUID.