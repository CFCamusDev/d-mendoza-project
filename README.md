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

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-org/dmendoza-sistema.git
cd dmendoza-sistema

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Ejecutar migraciones
cd backend && npx prisma migrate dev

# Iniciar en desarrollo
npm run dev
```

---

