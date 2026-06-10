import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Setup environment loader dynamically bridging to workspace root configuration
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Starting professional database seeding...');

  // ------------------------------------------------------------------
  // 1. Master Permissions Generation
  // ------------------------------------------------------------------
  const permissionRolesManage = await prisma.permission.upsert({
    where: { name: 'roles:manage' },
    update: {},
    create: {
      name: 'roles:manage',
      description: 'Capacidad para gestionar el catálogo de roles y asignar permisos administrativos.',
    },
  });

  const permissionUsersRead = await prisma.permission.upsert({
    where: { name: 'users:read' },
    update: {},
    create: {
      name: 'users:read',
      description: 'Capacidad para listar y visualizar perfiles de usuario.',
    },
  });

  const permissionUsersWrite = await prisma.permission.upsert({
    where: { name: 'users:write' },
    update: {},
    create: {
      name: 'users:write',
      description: 'Capacidad para activar/desactivar y modificar cuentas de usuario.',
    },
  });

  // HU-014: Permisos para gestión de productos y variantes SKU
  const permissionProductsRead = await prisma.permission.upsert({
    where: { name: 'products:read' },
    update: {},
    create: {
      name: 'products:read',
      description: 'Capacidad para listar y visualizar productos y sus variantes SKU.',
    },
  });

  const permissionProductsWrite = await prisma.permission.upsert({
    where: { name: 'products:write' },
    update: {},
    create: {
      name: 'products:write',
      description: 'Capacidad para crear, editar y gestionar productos y variantes SKU.',
    },
  });

  // HU-051: Permisos para gestión de inventario, proveedores e ingreso de mercadería
  const permissionInventoryRead = await prisma.permission.upsert({
    where: { name: 'inventory:read' },
    update: {},
    create: {
      name: 'inventory:read',
      description: 'Capacidad para visualizar proveedores e ingreso de mercadería.',
    },
  });

  const permissionInventoryWrite = await prisma.permission.upsert({
    where: { name: 'inventory:write' },
    update: {},
    create: {
      name: 'inventory:write',
      description: 'Capacidad para crear y modificar proveedores e ingresar mercadería.',
    },
  });

  // HU-034: Permisos para Punto de Venta (POS)
  const permissionPosDiscounts = await prisma.permission.upsert({
    where: { name: 'pos:discounts' },
    update: {},
    create: {
      name: 'pos:discounts',
      description: 'Capacidad para aplicar descuentos en el Punto de Venta (POS).',
    },
  });

  // HU-055: Permisos para Gestión y Consulta de Comprobantes Electrónicos
  const permissionSalesRead = await prisma.permission.upsert({
    where: { name: 'sales:read' },
    update: {},
    create: {
      name: 'sales:read',
      description: 'Capacidad para visualizar y consultar comprobantes de venta electrónicos.',
    },
  });

  console.log('✅ Master permissions registered.');

  // ------------------------------------------------------------------
  // 2. Standard System Roles Aggregation
  // ------------------------------------------------------------------
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: {
        connect: [
          { id: permissionRolesManage.id },
          { id: permissionUsersRead.id },
          { id: permissionUsersWrite.id },
          { id: permissionProductsRead.id },   // HU-014
          { id: permissionProductsWrite.id },  // HU-014
          { id: permissionInventoryRead.id },  // HU-051
          { id: permissionInventoryWrite.id }, // HU-051
          { id: permissionPosDiscounts.id },   // HU-034
          { id: permissionSalesRead.id },      // HU-055
        ],
      },
    },
    create: {
      name: 'ADMIN',
      description: 'Acceso total irrestricto a toda la plataforma.',
      permissions: {
        connect: [
          { id: permissionRolesManage.id },
          { id: permissionUsersRead.id },
          { id: permissionUsersWrite.id },
          { id: permissionProductsRead.id },   // HU-014
          { id: permissionProductsWrite.id },  // HU-014
          { id: permissionInventoryRead.id },  // HU-051
          { id: permissionInventoryWrite.id }, // HU-051
          { id: permissionPosDiscounts.id },   // HU-034
          { id: permissionSalesRead.id },      // HU-055
        ],
      },
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: {
      name: 'CLIENT',
      description: 'Rol estándar por defecto para compradores de la plataforma.',
    },
  });

  console.log(`✅ Core roles catalog initialized: [${adminRole.name}, ${clientRole.name}]`);

  // ------------------------------------------------------------------
  // 3. Seed Bootstrapping Admin User
  // ------------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !rawPassword) {
    throw new Error('Missing required environment variables for seed (adminEmail or rawPassword).');
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
    // Ensure existing test admin is promoted correctly
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        roles: { connect: { id: adminRole.id } },
        isActive: true,
      },
    });
    console.log(`ℹ️ Verified existing administrator promotions.`);
  }

  // ------------------------------------------------------------------
  // 4. Test Branches and Cash Registers Generation (HU-032 / Local POS Dev)
  // ------------------------------------------------------------------
  console.log('🌱 Seeding test branches and cash registers...');
  
  // Sede Miraflores
  let branchMiraflores = await prisma.branch.findFirst({ where: { name: 'Sede Miraflores' } });
  if (!branchMiraflores) {
    branchMiraflores = await prisma.branch.create({
      data: {
        name: 'Sede Miraflores',
        address: 'Av. Larco 123, Miraflores',
        phone: '+511234567',
        isActive: true,
      }
    });
    await prisma.warehouse.create({
      data: { branchId: branchMiraflores.id }
    });
  }

  // Sede San Isidro
  let branchSanIsidro = await prisma.branch.findFirst({ where: { name: 'Sede San Isidro' } });
  if (!branchSanIsidro) {
    branchSanIsidro = await prisma.branch.create({
      data: {
        name: 'Sede San Isidro',
        address: 'Av. Javier Prado 456, San Isidro',
        phone: '+511765432',
        isActive: true,
      }
    });
    await prisma.warehouse.create({
      data: { branchId: branchSanIsidro.id }
    });
  }

  // Seeding Cash Registers for Miraflores
  const existingRegister1 = await prisma.cashRegister.findUnique({ where: { id: 1 } });
  if (!existingRegister1) {
    await prisma.cashRegister.create({
      data: {
        id: 1,
        branchId: branchMiraflores.id,
        name: 'Caja Principal - Miraflores'
      }
    });
  }

  const existingRegister2 = await prisma.cashRegister.findUnique({ where: { id: 2 } });
  if (!existingRegister2) {
    await prisma.cashRegister.create({
      data: {
        id: 2,
        branchId: branchMiraflores.id,
        name: 'Caja Secundaria - Miraflores'
      }
    });
  }

  // Seeding Cash Registers for San Isidro
  const existingRegister3 = await prisma.cashRegister.findUnique({ where: { id: 3 } });
  if (!existingRegister3) {
    await prisma.cashRegister.create({
      data: {
        id: 3,
        branchId: branchSanIsidro.id,
        name: 'Caja Principal - San Isidro'
      }
    });
  }

  console.log('✅ Seeded test branches and cash registers successfully.');

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
