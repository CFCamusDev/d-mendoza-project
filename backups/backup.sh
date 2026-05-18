#!/bin/bash

# Configuración leída de variables de entorno (pasadas por el docker-compose)
DB_HOST=${DB_HOST:-database}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_DATABASE}

# Nombre del archivo con la fecha actual
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/backups/${DB_NAME}_backup_${DATE}.sql"

echo "[Backup] Iniciando respaldo de la base de datos '${DB_NAME}' en el host '${DB_HOST}'..."

# Volcado usando mysqldump
mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "[Backup] Respaldo completado exitosamente: ${BACKUP_FILE}"
else
  echo "[Backup] ERROR: Falló el respaldo de la base de datos."
  # Opcional: Eliminar el archivo si falló para no tener basura
  rm -f "${BACKUP_FILE}"
fi
