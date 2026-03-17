import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async buyTicket(userId: string, eventId: string) {
    // Проверяем существование события
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    // Генерируем уникальный QR-код
    const qrCode = `OREN-${uuid().slice(0, 8).toUpperCase()}-${Date.now()}`;

    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        eventId,
        qrCode,
      },
      include: {
        event: {
          include: { category: true },
        },
      },
    });

    return ticket;
  }

  async getMyTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          include: { category: true },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return tickets;
  }

  async getTicket(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: {
        event: {
          include: { category: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Билет не найден');
    }

    return ticket;
  }

  async getUpcomingTickets(userId: string) {
    const now = new Date();

    return this.prisma.ticket.findMany({
      where: {
        userId,
        event: {
          date: { gte: now },
        },
      },
      include: {
        event: {
          include: { category: true },
        },
      },
      orderBy: { event: { date: 'asc' } },
    });
  }

  async getTodayTickets(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.ticket.findMany({
      where: {
        userId,
        event: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
      include: {
        event: {
          include: { category: true },
        },
      },
    });
  }
}
