# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar bcrypt y usar Prisma (Forzando IPv4 para evitar bugs de red de Docker)
RUN apt-get update -o Acquire::ForceIPv4=true && apt-get install -y -o Acquire::ForceIPv4=true \
    openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Instalar TODAS las dependencias (aumentando reintentos para redes inestables)
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm ci --ignore-scripts

COPY . .

# Generar cliente de Prisma con variable dummy para evitar errores de validación
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate

# Transpilar TypeScript a JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update -o Acquire::ForceIPv4=true && apt-get install -y -o Acquire::ForceIPv4=true \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm ci --omit=dev --ignore-scripts

# Copiar archivos necesarios desde el stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copiar el cliente Prisma generado (es crucial porque npm ci lo limpia)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["node", "dist/server.js"]
