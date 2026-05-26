import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto, AdminUsersQueryDto } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listUsers(query: AdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { surname: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          city: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createAdmin(dto: CreateAdminUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const hashed = await bcrypt.hash(dto.password, 10);

    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        throw new ConflictException('Пользователь уже является администратором');
      }
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          role: UserRole.ADMIN,
          password: hashed,
          name: dto.name,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getAttendanceAnalytics() {
    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        _count: { select: { tickets: true } },
      },
    });

    const byEvent = [...events]
      .map((e) => ({
        eventId: e.id,
        title: e.title,
        eventDate: e.date,
        ticketCount: e._count.tickets,
      }))
      .sort((a, b) => b.ticketCount - a.ticketCount);

    const from = new Date();
    from.setDate(from.getDate() - 90);

    const dailyRows = await this.prisma.$queryRaw<
      { day: Date; purchases: bigint }[]
    >`
      SELECT DATE("purchaseDate") AS day, COUNT(*)::bigint AS purchases
      FROM tickets
      WHERE "purchaseDate" >= ${from}
      GROUP BY DATE("purchaseDate")
      ORDER BY day ASC
    `;

    const purchasesByDay = dailyRows.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      purchases: Number(row.purchases),
    }));

    return { byEvent, purchasesByDay };
  }
}
