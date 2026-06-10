import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type CategoryKey =
  | 'concerts'
  | 'theater'
  | 'exhibitions'
  | 'sport'
  | 'cinema'
  | 'festivals'
  | 'workshops'
  | 'kids';

const categoryDefs: Record<
  CategoryKey,
  { name: string; color: string; icon: string }
> = {
  concerts: { name: 'Концерты', color: '#FF6B6B', icon: 'music' },
  theater: { name: 'Театр', color: '#4ECDC4', icon: 'theater-masks' },
  exhibitions: { name: 'Выставки', color: '#45B7D1', icon: 'palette' },
  sport: { name: 'Спорт', color: '#96CEB4', icon: 'futbol' },
  cinema: { name: 'Кино', color: '#FFEAA7', icon: 'film' },
  festivals: { name: 'Фестивали', color: '#DDA0DD', icon: 'star' },
  workshops: { name: 'Мастер-классы', color: '#98D8C8', icon: 'paint-brush' },
  kids: { name: 'Для детей', color: '#F7DC6F', icon: 'child' },
};

function summerDate(month: number, day: number): Date {
  return new Date(Date.UTC(2026, month - 1, day, 12, 0, 0));
}

function img(text: string) {
  const seed = encodeURIComponent(text.replace(/\s+/g, '-').toLowerCase());
  return [`https://picsum.photos/seed/orenplace-${seed}/800/400`];
}

async function main() {
  console.log('🗑 Очистка старых данных...');
  await prisma.ticket.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories: Record<CategoryKey, { id: string }> = {} as Record<
    CategoryKey,
    { id: string }
  >;

  for (const [key, def] of Object.entries(categoryDefs) as [
    CategoryKey,
    (typeof categoryDefs)[CategoryKey],
  ][]) {
    const cat = await prisma.category.create({ data: def });
    categories[key] = cat;
  }

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

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Администратор',
      email: 'admin@orenplace.ru',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const eventsData: Array<{
    title: string;
    description: string;
    date: Date;
    time: string;
    price: number;
    address: string;
    isPopular: boolean;
    images: string[];
    category: CategoryKey;
  }> = [
    // Июнь 2026
    {
      title: 'Открытие летнего сезона на набережной',
      description:
        'Праздник с живой музыкой, фуд-кортом и фейерверком в честь начала лета на Урале.',
      date: summerDate(6, 1),
      time: '18:00',
      price: 0,
      address: 'Набережная р. Урал',
      isPopular: true,
      images: img('Лето+2026', 'DDA0DD'),
      category: 'festivals',
    },
    {
      title: 'Концерт «Любэ»',
      description: 'Легендарная группа с программой лучших песен под открытым небом.',
      date: summerDate(6, 7),
      time: '19:30',
      price: 3200,
      address: 'Стадион «Газовик», ул. Терешковой, 10',
      isPopular: true,
      images: img('Любэ', 'FF6B6B'),
      category: 'concerts',
    },
    {
      title: 'Спектакль «Евгений Онегин»',
      description: 'Классическая опера в современной сценической интерпретации.',
      date: summerDate(6, 12),
      time: '18:00',
      price: 1200,
      address: 'Оренбургский театр оперы и балета, пр. Победы, 1',
      isPopular: true,
      images: img('Онегин', '4ECDC4'),
      category: 'theater',
    },
    {
      title: 'Выставка «Оренбургский платок»',
      description: 'История пухового платка и современные работы мастериц региона.',
      date: summerDate(6, 15),
      time: '10:00',
      price: 350,
      address: 'Музей изобразительных искусств, ул. Каширина, 29',
      isPopular: false,
      images: img('Платок', '45B7D1'),
      category: 'exhibitions',
    },
    {
      title: 'ФК «Оренбург» — ЦСКА',
      description: 'Матч РПЛ на домашнем стадионе. Поддержите команду!',
      date: summerDate(6, 21),
      time: '17:00',
      price: 600,
      address: 'Стадион «Газовик», ул. Терешковой, 10',
      isPopular: true,
      images: img('Футбол', '96CEB4'),
      category: 'sport',
    },
    {
      title: 'Киновечер «Дюна: часть три»',
      description: 'Специальный показ блокбастера в формате IMAX.',
      date: summerDate(6, 14),
      time: '21:00',
      price: 450,
      address: 'Кинотеатр «Космос», ул. Пролетарская, 24',
      isPopular: false,
      images: img('Кино', 'FFEAA7'),
      category: 'cinema',
    },
    {
      title: 'Мастер-класс по керамике',
      description: 'Создайте свою чашку или вазу. Все материалы включены.',
      date: summerDate(6, 18),
      time: '14:00',
      price: 1800,
      address: 'Арт-пространство «Бункер», ул. Кирова, 15',
      isPopular: false,
      images: img('Керамика', '98D8C8'),
      category: 'workshops',
    },
    {
      title: 'Детский фестиваль «Солнечный город»',
      description: 'Аниматоры, мастер-классы, спектакли и игровые зоны для всей семьи.',
      date: summerDate(6, 28),
      time: '11:00',
      price: 500,
      address: 'Парк Победы, ул. Монтажников',
      isPopular: true,
      images: img('Дети', 'F7DC6F'),
      category: 'kids',
    },
    // Июль 2026
    {
      title: 'Фестиваль «Уральская волна»',
      description: 'Два дня музыки, ярмарки и уличной еды на набережной.',
      date: summerDate(7, 4),
      time: '12:00',
      price: 0,
      address: 'Набережная р. Урал',
      isPopular: true,
      images: img('Волна', 'DDA0DD'),
      category: 'festivals',
    },
    {
      title: 'Концерт Zivert',
      description: 'Сольный концерт с новой программой и лазерным шоу.',
      date: summerDate(7, 11),
      time: '20:00',
      price: 4500,
      address: 'ДК «Газовик», ул. Чкалова, 32',
      isPopular: true,
      images: img('Zivert', 'FF6B6B'),
      category: 'concerts',
    },
    {
      title: 'Комедия «Свадьба в малиновке»',
      description: 'Лёгкий спектакль для летнего вечера в драматическом театре.',
      date: summerDate(7, 16),
      time: '19:00',
      price: 900,
      address: 'Оренбургский драматический театр, ул. Советская, 26',
      isPopular: false,
      images: img('Свадьба', '4ECDC4'),
      category: 'theater',
    },
    {
      title: 'Фотовыставка «Степь в объективе»',
      description: 'Работы оренбургских фотографов о природе и жизни региона.',
      date: summerDate(7, 8),
      time: '11:00',
      price: 200,
      address: 'Галерея «Арт-Оренбург», ул. Краснознамённая, 56',
      isPopular: false,
      images: img('Фото', '45B7D1'),
      category: 'exhibitions',
    },
    {
      title: 'Турнир по пляжному волейболу',
      description: 'Любительский турнир на песчаной площадке. Регистрация команд онлайн.',
      date: summerDate(7, 19),
      time: '10:00',
      price: 0,
      address: 'Пляж «Салют», пос. Пригородный',
      isPopular: false,
      images: img('Волейбол', '96CEB4'),
      category: 'sport',
    },
    {
      title: 'Киномарафон короткометражек',
      description: 'Подборка фильмов молодых режиссёров Оренбурга и России.',
      date: summerDate(7, 22),
      time: '18:30',
      price: 300,
      address: 'Кинотеатр «Мир», пр. Победы, 80',
      isPopular: false,
      images: img('Киномарафон', 'FFEAA7'),
      category: 'cinema',
    },
    {
      title: 'Йога на закате',
      description: 'Открытый класс для начинающих и продолжающих. Коврик возьмите с собой.',
      date: summerDate(7, 25),
      time: '19:30',
      price: 400,
      address: 'Сквер имени Столыпина',
      isPopular: false,
      images: img('Йога', '98D8C8'),
      category: 'workshops',
    },
    {
      title: 'Цирковое шоу «Летняя сказка»',
      description: 'Представление для детей с акробатами, клоунами и дрессированными животными.',
      date: summerDate(7, 13),
      time: '12:00',
      price: 800,
      address: 'Цирк, ул. Володарского, 12',
      isPopular: true,
      images: img('Цирк', 'F7DC6F'),
      category: 'kids',
    },
    // Август 2026
    {
      title: 'Концерт «Би-2»',
      description: 'Большой сольный концерт группы «Би-2» в Оренбурге.',
      date: summerDate(8, 2),
      time: '20:00',
      price: 3800,
      address: 'Стадион «Газовик», ул. Терешковой, 10',
      isPopular: true,
      images: img('Би-2', 'FF6B6B'),
      category: 'concerts',
    },
    {
      title: 'Спектакль «Вишнёвый сад»',
      description: 'Чехов в постановке молодой режиссёрской группы.',
      date: summerDate(8, 9),
      time: '18:30',
      price: 1100,
      address: 'Оренбургский драматический театр, ул. Советская, 26',
      isPopular: false,
      images: img('Вишневый+сад', '4ECDC4'),
      category: 'theater',
    },
    {
      title: 'Фестиваль уличной еды',
      description: 'Более 40 фудтраков, конкурсы и живая музыка каждые выходные.',
      date: summerDate(8, 16),
      time: '12:00',
      price: 0,
      address: 'Набережная р. Урал',
      isPopular: true,
      images: img('Еда', 'DDA0DD'),
      category: 'festivals',
    },
    {
      title: 'Выставка современного искусства «Город X»',
      description: 'Инсталляции, графика и цифровое искусство от уральских авторов.',
      date: summerDate(8, 5),
      time: '10:00',
      price: 400,
      address: 'Музей изобразительных искусств, ул. Каширина, 29',
      isPopular: false,
      images: img('Город+X', '45B7D1'),
      category: 'exhibitions',
    },
    {
      title: 'Забег «Оренбургский марафон»',
      description: 'Дистанции 5, 10 и 21 км. Медали всем финишёрам.',
      date: summerDate(8, 23),
      time: '08:00',
      price: 1200,
      address: 'Старт: пл. Победы',
      isPopular: true,
      images: img('Марафон', '96CEB4'),
      category: 'sport',
    },
    {
      title: 'Кино под звёздами: «Гардемарины»',
      description: 'Классика советского кино на открытом экране.',
      date: summerDate(8, 14),
      time: '21:30',
      price: 0,
      address: 'Амфитеатр в Парке Победы',
      isPopular: false,
      images: img('Гардемарины', 'FFEAA7'),
      category: 'cinema',
    },
    {
      title: 'Мастер-класс по акварели',
      description: 'Рисуем степной пейзаж. Краски и бумага предоставляются.',
      date: summerDate(8, 20),
      time: '15:00',
      price: 1500,
      address: 'Творческий кластер «Ключ», ул. Салмышская, 71',
      isPopular: false,
      images: img('Акварель', '98D8C8'),
      category: 'workshops',
    },
    {
      title: 'Кукольный спектакль «Три поросёнка»',
      description: 'Интерактивная постановка для детей 3–8 лет.',
      date: summerDate(8, 10),
      time: '11:00',
      price: 550,
      address: 'ТЮЗ, ул. Советская, 41',
      isPopular: false,
      images: img('Поросята', 'F7DC6F'),
      category: 'kids',
    },
    // Сентябрь 2026 (конец лета)
    {
      title: 'Концерт «Мот»',
      description: 'Закрытие концертного лета — большой сольный концерт.',
      date: summerDate(9, 5),
      time: '19:00',
      price: 3500,
      address: 'ДК «Газовик», ул. Чкалова, 32',
      isPopular: true,
      images: img('Мот', 'FF6B6B'),
      category: 'concerts',
    },
    {
      title: 'Театральный фестиваль «Оренбургская осень»',
      description: 'Гастроли коллективов из Москвы, Казани и Самары.',
      date: summerDate(9, 12),
      time: '17:00',
      price: 1500,
      address: 'Оренбургский драматический театр, ул. Советская, 26',
      isPopular: true,
      images: img('Фестиваль', '4ECDC4'),
      category: 'theater',
    },
    {
      title: 'Ярмарка ремёсел «Уральские узоры»',
      description: 'Изделия мастеров, дегустации и народные гуляния.',
      date: summerDate(9, 19),
      time: '11:00',
      price: 0,
      address: 'Сквер у Дворца спорта «Газовик»',
      isPopular: false,
      images: img('Ярмарка', 'DDA0DD'),
      category: 'festivals',
    },
    {
      title: 'Выставка «День города Оренбурга»',
      description: 'История города в фотографиях, документах и интерактивных стендах.',
      date: summerDate(9, 7),
      time: '10:00',
      price: 0,
      address: 'Краеведческий музей, ул. Пушкинская, 6',
      isPopular: true,
      images: img('День+города', '45B7D1'),
      category: 'exhibitions',
    },
    {
      title: 'Товарищеский матч по баскетболу',
      description: 'Сборная Оренбурга против команд соседних регионов.',
      date: summerDate(9, 14),
      time: '18:00',
      price: 300,
      address: 'Дворец спорта «Газовик»',
      isPopular: false,
      images: img('Баскетбол', '96CEB4'),
      category: 'sport',
    },
    {
      title: 'Премьера «Оренбург — город мечты»',
      description: 'Документальный фильм о развитии города. Q&A с режиссёром.',
      date: summerDate(9, 21),
      time: '19:00',
      price: 350,
      address: 'Кинотеатр «Космос», ул. Пролетарская, 24',
      isPopular: false,
      images: img('Премьера', 'FFEAA7'),
      category: 'cinema',
    },
    {
      title: 'Кулинарный мастер-класс «Уральские пельмени»',
      description: 'Учимся лепить пельмени с шеф-поваром местного ресторана.',
      date: summerDate(9, 26),
      time: '13:00',
      price: 2200,
      address: 'Гастрономическая студия «Вкус», ул. Ткачева, 8',
      isPopular: false,
      images: img('Пельмени', '98D8C8'),
      category: 'workshops',
    },
    {
      title: 'Шоу мыльных пузырей «Волшебное лето»',
      description: 'Зрелищное шоу для детей и родителей на открытом воздухе.',
      date: summerDate(9, 28),
      time: '16:00',
      price: 600,
      address: 'Парк имени 30-летия Победы',
      isPopular: false,
      images: img('Пузыри', 'F7DC6F'),
      category: 'kids',
    },
  ];

  const events = await Promise.all(
    eventsData.map((e) =>
      prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          date: e.date,
          time: e.time,
          price: e.price,
          address: e.address,
          isPopular: e.isPopular,
          images: e.images,
          categoryId: categories[e.category].id,
        },
      }),
    ),
  );

  console.log('✅ Seed выполнен успешно!');
  console.log(`📂 Категорий: ${Object.keys(categories).length}`);
  console.log(`📅 Событий: ${events.length} (июнь — сентябрь 2026)`);
  console.log(`👤 Тест: ${user.email} / password123`);
  console.log(`🛡 Админ: ${admin.email} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
