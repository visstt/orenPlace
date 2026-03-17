import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Создаем категории
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Концерты', color: '#FF6B6B', icon: 'music' },
    }),
    prisma.category.create({
      data: { name: 'Театр', color: '#4ECDC4', icon: 'theater-masks' },
    }),
    prisma.category.create({
      data: { name: 'Выставки', color: '#45B7D1', icon: 'palette' },
    }),
    prisma.category.create({
      data: { name: 'Спорт', color: '#96CEB4', icon: 'futbol' },
    }),
    prisma.category.create({
      data: { name: 'Кино', color: '#FFEAA7', icon: 'film' },
    }),
    prisma.category.create({
      data: { name: 'Фестивали', color: '#DDA0DD', icon: 'star' },
    }),
    prisma.category.create({
      data: { name: 'Мастер-классы', color: '#98D8C8', icon: 'paint-brush' },
    }),
    prisma.category.create({
      data: { name: 'Для детей', color: '#F7DC6F', icon: 'child' },
    }),
  ]);

  // Создаем тестового пользователя
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Иван',
      surname: 'Иванов',
      email: 'test@orenplace.ru',
      phone: '+7 (912) 345-67-89',
      city: 'Оренбург',
      password: hashedPassword,
    },
  });

  // Создаем события
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Концерт группы «Сплин»',
        description:
          'Легендарная группа «Сплин» приезжает в Оренбург с большим концертом! Вас ждут все хиты и новые песни.',
        date: new Date('2026-03-15'),
        time: '19:00',
        price: 2500,
        address: 'ДК «Газовик», ул. Чкалова, 32',
        isPopular: true,
        images: [
          'https://placehold.co/800x400/8E2DE2/white?text=Сплин',
        ],
        categoryId: categories[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Спектакль «Ревизор»',
        description:
          'Классическая комедия Н.В. Гоголя в современной постановке Оренбургского драматического театра.',
        date: new Date('2026-03-20'),
        time: '18:30',
        price: 800,
        address: 'Оренбургский драматический театр, ул. Советская, 26',
        isPopular: true,
        images: [
          'https://placehold.co/800x400/4ECDC4/white?text=Ревизор',
        ],
        categoryId: categories[1].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Выставка «Степные мотивы»',
        description:
          'Выставка работ оренбургских художников, посвященная красоте степного края.',
        date: new Date('2026-03-10'),
        time: '10:00',
        price: 300,
        address: 'Музей изобразительных искусств, ул. Каширина, 29',
        isPopular: false,
        images: [
          'https://placehold.co/800x400/45B7D1/white?text=Выставка',
        ],
        categoryId: categories[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Матч ФК «Оренбург» — ФК «Зенит»',
        description:
          'Футбольный матч Российской Премьер-Лиги. ФК «Оренбург» принимает ФК «Зенит» на домашнем стадионе.',
        date: new Date('2026-04-05'),
        time: '16:00',
        price: 500,
        address: 'Стадион «Газовик», ул. Терешковой, 10',
        isPopular: true,
        images: [
          'https://placehold.co/800x400/96CEB4/white?text=Футбол',
        ],
        categoryId: categories[3].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Премьера фильма «Оренбургский платок»',
        description:
          'Специальный показ нового фильма о знаменитом оренбургском пуховом платке.',
        date: new Date('2026-03-25'),
        time: '20:00',
        price: 400,
        address: 'Кинотеатр «Космос», ул. Пролетарская, 24',
        isPopular: false,
        images: [
          'https://placehold.co/800x400/FFEAA7/333?text=Кино',
        ],
        categoryId: categories[4].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Фестиваль уличной еды',
        description:
          'Крупнейший фестиваль уличной еды в Оренбурге! Более 50 фудтраков, живая музыка и развлечения.',
        date: new Date('2026-04-12'),
        time: '12:00',
        price: 0,
        address: 'Набережная р. Урал',
        isPopular: true,
        images: [
          'https://placehold.co/800x400/DDA0DD/white?text=Фестиваль',
        ],
        categoryId: categories[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Мастер-класс по гончарному делу',
        description:
          'Научитесь создавать глиняную посуду на гончарном круге. Все материалы включены.',
        date: new Date('2026-03-18'),
        time: '14:00',
        price: 1500,
        address: 'Арт-пространство «Бункер», ул. Кирова, 15',
        isPopular: false,
        images: [
          'https://placehold.co/800x400/98D8C8/white?text=Мастер-класс',
        ],
        categoryId: categories[6].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Детский спектакль «Колобок»',
        description:
          'Интерактивный спектакль для детей от 3 до 7 лет по мотивам русской народной сказки.',
        date: new Date('2026-03-22'),
        time: '11:00',
        price: 600,
        address: 'ТЮЗ, ул. Советская, 41',
        isPopular: false,
        images: [
          'https://placehold.co/800x400/F7DC6F/333?text=Детский+спектакль',
        ],
        categoryId: categories[7].id,
      },
    }),
  ]);

  console.log('✅ Seed выполнен успешно!');
  console.log(`📂 Создано категорий: ${categories.length}`);
  console.log(`📅 Создано событий: ${events.length}`);
  console.log(`👤 Создан пользователь: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
