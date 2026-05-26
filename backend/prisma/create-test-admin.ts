/**
 * Создаёт или обновляет тестового администратора (можно запускать многократно).
 *
 * Запуск из папки backend:
 *   npm run prisma:create-test-admin
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TEST_ADMIN = {
  email: 'test-admin@orenplace.local',
  password: 'TestAdmin123',
  name: 'Тестовый администратор',
};

async function main() {
  const hashed = await bcrypt.hash(TEST_ADMIN.password, 10);
  const existing = await prisma.user.findUnique({
    where: { email: TEST_ADMIN.email },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: UserRole.ADMIN,
        password: hashed,
        name: TEST_ADMIN.name,
      },
    });
    console.log('✅ Тестовый админ обновлён (роль и пароль сброшены на тестовые).');
  } else {
    await prisma.user.create({
      data: {
        email: TEST_ADMIN.email,
        password: hashed,
        name: TEST_ADMIN.name,
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Тестовый админ создан.');
  }

  console.log('');
  console.log('   Email:    ', TEST_ADMIN.email);
  console.log('   Пароль:   ', TEST_ADMIN.password);
  console.log('');
  console.log('   Админ-панель: http://localhost:3000/admin/');
  console.log('   (если PORT в .env другой — подставьте свой порт)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
