# D'Mendoza — Sistema Integrado de Gestión Comercial

Plataforma omnicanal para la gestión comercial de D'Mendoza, una empresa del sector retail de moda. Integra en un solo sistema la tienda online, el punto de venta físico y un panel administrativo centralizado con soporte para múltiples sucursales.

---

## Módulos

- **E-Commerce** — Tienda online con catálogo, carrito, pasarela de pagos, tracking de pedidos y programa de fidelización.
- **POS (Punto de Venta)** — Ventas físicas con gestión de caja, emisión de comprobantes térmicos y soporte para ventas entre sucursales (Cross-Branch).
- **Panel Administrativo** — Control centralizado de inventario, finanzas, logística de despacho, CRM y reportes de negocio.

---

## Tecnologías

| Capa          | Tecnología                      |
| ------------- | ------------------------------- |
| Frontend      | React, TypeScript               |
| Backend       | Node.js, Express.js, TypeScript |
| Base de datos | MariaDB, Prisma ORM             |

### Integraciones externas

| Servicio                            | Tipo                   | Uso                                                                                     |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| [FACTILIZA](https://factiliza.com/) | Business API (Perú)    | WhatsApp Business, consulta DNI/RUC, emisión de boletas y facturas electrónicas (SUNAT) |
| [Resend](https://resend.com/)       | Email Delivery Service | Envío transaccional de correos (verificación, notificaciones, recordatorios)            |

---

## ⚙️ Instalación local (sin Docker)

```bash
# Clonar repositorio
git clone https://github.com/tu-org/d-mendoza-sistema.git
cd d-mendoza-sistema

# Instalar dependencias
cd server && npm install
cd ../client && npm install

# Ejecutar migraciones
cd server && npx prisma migrate dev

# Iniciar en desarrollo
npm run dev
```

---

## 🐳 Levantar con Docker

### Prerequisitos

- Tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/d-mendoza-sistema.git
cd d-mendoza-sistema

# 2. Copiar el archivo de variables de entorno y ajustar los valores
cp .env.example .env

# 3. Levantar todos los servicios en segundo plano
docker compose up -d
```

> Los contenedores arrancan en orden garantizado: `database` → `server` → `client`.
> El servidor espera a que MariaDB esté saludable antes de iniciar.

### URLs de acceso

| Servicio | URL                              |
| -------- | -------------------------------- |
| Cliente  | http://localhost:5173            |
| Servidor | http://localhost:3000/api        |
| Health   | http://localhost:3000/api/health |

### Comandos útiles

```bash
# Ver logs en tiempo real de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f server

# Ver el estado de los contenedores
docker compose ps

# Bajar todos los contenedores
docker compose down

# Bajar y eliminar los volúmenes (resetea la base de datos)
docker compose down -v
```

---
