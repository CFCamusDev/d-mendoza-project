import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Setup environment loader dynamically bridging to workspace root configuration
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting professional database seeding...');

  // ------------------------------------------------------------------
  // 1. Master Permissions Generation
  // ------------------------------------------------------------------
  const permissionsData = [
    { name: 'roles:manage', description: 'Capacidad para gestionar el catálogo de roles, asignar permisos y cambiar el estado de órdenes.' },
    { name: 'users:read', description: 'Capacidad para listar y visualizar perfiles de usuario.' },
    { name: 'users:write', description: 'Capacidad para activar/desactivar y modificar cuentas de usuario.' },
    { name: 'products:read', description: 'Capacidad para listar y visualizar productos, variantes SKU y Kardex.' },
    { name: 'products:write', description: 'Capacidad para crear, editar y gestionar productos, variantes SKU, marcas y categorías.' },
    { name: 'inventory:read', description: 'Capacidad para visualizar proveedores, stock, alertas y transferencias.' },
    { name: 'inventory:write', description: 'Capacidad para crear y modificar proveedores, ingresar mercadería, transferencias y auditorías.' },
    { name: 'pos:discounts', description: 'Capacidad para aplicar descuentos en el Punto de Venta (POS).' },
    { name: 'sales:read', description: 'Capacidad para visualizar y consultar comprobantes de venta, KPIs y reportes.' },
  ];

  console.log('🌱 Seeding permissions...');
  const permissions = [];
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
    permissions.push(p);
  }
  console.log(`✅ ${permissions.length} master permissions registered.`);

  // ------------------------------------------------------------------
  // 2. Standard System Roles Aggregation
  // ------------------------------------------------------------------
  console.log('🌱 Seeding roles...');
  const rolesConfig = [
    {
      name: 'ADMIN',
      description: 'Acceso total irrestricto a toda la plataforma.',
      permissions: [
        'roles:manage', 'users:read', 'users:write',
        'products:read', 'products:write',
        'inventory:read', 'inventory:write',
        'pos:discounts', 'sales:read'
      ],
    },
    {
      name: 'SELLER',
      description: 'Rol para vendedores en tienda física (POS).',
      permissions: ['products:read', 'pos:discounts', 'sales:read', 'users:read'],
    },
    {
      name: 'SUPPLY',
      description: 'Rol para personal de abastecimiento y control de inventario.',
      permissions: ['inventory:read', 'inventory:write', 'products:read'],
    },
    {
      name: 'DELIVERY',
      description: 'Rol para personal de despacho y entrega de pedidos.',
      permissions: ['sales:read', 'roles:manage', 'users:read'],
    },
    {
      name: 'CLIENT',
      description: 'Rol estándar por defecto para compradores de la plataforma (e-commerce).',
      permissions: [],
    },
  ];

  for (const roleConf of rolesConfig) {
    const connectPerms = permissions
      .filter((p) => roleConf.permissions.includes(p.name))
      .map((p) => ({ id: p.id }));

    await prisma.role.upsert({
      where: { name: roleConf.name },
      update: {
        description: roleConf.description,
        permissions: {
          set: connectPerms,
        },
      },
      create: {
        name: roleConf.name,
        description: roleConf.description,
        permissions: {
          connect: connectPerms,
        },
      },
    });
  }
  console.log(`✅ ${rolesConfig.length} roles initialized successfully.`);

  // ------------------------------------------------------------------
  // 3. Seed Bootstrapping Admin User
  // ------------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !rawPassword) {
    throw new Error('Missing required environment variables for seed (adminEmail or rawPassword).');
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    throw new Error('ADMIN role was not created successfully.');
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Global Administrator',
        password: hashedPassword,
        isActive: true,
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });
    console.log(`✅ Seeded default Administrator: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        isActive: true,
        roles: {
          set: [{ id: adminRole.id }],
        },
      },
    });
    console.log(`ℹ️ Verified existing administrator promotions.`);
  }

  console.log('🚀 Seed execution finalized successfully.\n');
}

main()
  .catch((e) => {
    console.error('❌ Critical seed runtime failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
