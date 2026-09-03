import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const depts = ['Finance', 'Sales', 'HR', 'IT'];
  for (const name of depts) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
