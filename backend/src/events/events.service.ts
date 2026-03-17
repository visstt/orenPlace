import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: EventQueryDto) {
    const {
      search,
      categoryId,
      dateFrom,
      dateTo,
      sortBy = 'date',
      order = 'asc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    orderBy[sortBy] = order;

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          _count: { select: { favorites: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPopular() {
    return this.prisma.event.findMany({
      where: { isPopular: true },
      include: {
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { favorites: true, tickets: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    return event;
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        time: dto.time,
        price: dto.price,
        address: dto.address,
        isPopular: dto.isPopular ?? false,
        images: dto.images ?? [],
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);

    return this.prisma.event.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async search(query: string) {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: 20,
    });
  }
}
