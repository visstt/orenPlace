import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { events: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      ...cat,
      eventsCount: cat._count.events,
    }));
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { events: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async findEvents(id: string) {
    await this.findOne(id);

    return this.prisma.event.findMany({
      where: { categoryId: id },
      include: {
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { date: 'asc' },
    });
  }
}
