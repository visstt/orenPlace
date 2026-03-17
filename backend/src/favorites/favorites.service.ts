import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            category: true,
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.event);
  }

  async addFavorite(userId: string, eventId: string) {
    // Проверяем событие
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    // Проверяем, нет ли уже в избранном
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      return { message: 'Уже в избранном', isFavorite: true };
    }

    await this.prisma.favorite.create({
      data: { userId, eventId },
    });

    return { message: 'Добавлено в избранное', isFavorite: true };
  }

  async removeFavorite(userId: string, eventId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Не найдено в избранном');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    return { message: 'Удалено из избранного', isFavorite: false };
  }

  async checkFavorite(userId: string, eventId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    return { isFavorite: !!favorite };
  }
}
