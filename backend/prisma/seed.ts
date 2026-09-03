import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Tạo các Role
  const rolesData = ['Super Admin', 'Manager', 'Leader', 'Employee', 'Intern'];
  const createdRoles = {};
  for (const roleName of rolesData) {
    createdRoles[roleName] = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // 2. Tạo các Module
  const modulesData = ['Social', 'CRM', 'Recruiting', 'Training', 'User', 'Role', 'Department'];
  const createdModules = {};
  for (const modName of modulesData) {
    createdModules[modName] = await prisma.module.upsert({
      where: { name: modName },
      update: {},
      create: { name: modName },
    });
  }

  // 3. Gán full quyền cho Manager
  const managerRole = createdRoles['Manager'];
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'];
  for (const modName of modulesData) {
    const mod = createdModules[modName];
    for (const action of actions) {
      // Upsert permission
      // Seed permission logic manually to avoid null unique issues
      const exists = await prisma.permission.findFirst({
        where: {
          roleId: managerRole.id,
          moduleId: mod.id,
          action: action,
        },
      });

      if (!exists) {
        await prisma.permission.create({
          data: {
            roleId: managerRole.id,
            moduleId: mod.id,
            action: action,
          },
        });
      }
    }
  }

  // 4. Tạo Super Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@bizsocial.com' },
    update: {},
    create: {
      email: 'admin@bizsocial.com',
      password: adminPassword,
      name: 'Super Admin',
      roleId: createdRoles['Super Admin'].id,
    },
  });

  // 5. Tạo Manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@bizsocial.com' },
    update: {},
    create: {
      email: 'manager@bizsocial.com',
      password: managerPassword,
      name: 'Manager User',
      roleId: managerRole.id,
    },
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
