import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

  console.log('✅ Master permissions registered.');

  // ------------------------------------------------------------------
  // 2. Standard System Roles Aggregation
  // ------------------------------------------------------------------
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {
      permissions: {
        connect: [
          { id: permissionRolesManage.id },
          { id: permissionUsersRead.id },
        ],
      },
    },
    create: {
      name: 'SUPERADMIN',
      description: 'Acceso total irrestricto a toda la plataforma.',
      permissions: {
        connect: [
          { id: permissionRolesManage.id },
          { id: permissionUsersRead.id },
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
  const adminEmail = 'admin@dmendoza.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminPass123!', 12);
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
