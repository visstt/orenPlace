import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Билеты')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('buy/:eventId')
  @ApiOperation({ summary: 'Купить билет на мероприятие' })
  buyTicket(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.ticketsService.buyTicket(userId, eventId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить мои билеты' })
  getMyTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.getMyTickets(userId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Билеты на сегодня' })
  getTodayTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.getTodayTickets(userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Предстоящие билеты' })
  getUpcomingTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.getUpcomingTickets(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить билет по ID' })
  getTicket(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    return this.ticketsService.getTicket(userId, ticketId);
  }
}
