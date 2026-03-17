import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Избранное')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список избранных мероприятий' })
  getFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Post(':eventId')
  @ApiOperation({ summary: 'Добавить в избранное' })
  addFavorite(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.favoritesService.addFavorite(userId, eventId);
  }

  @Delete(':eventId')
  @ApiOperation({ summary: 'Удалить из избранного' })
  removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, eventId);
  }

  @Get('check/:eventId')
  @ApiOperation({ summary: 'Проверить, в избранном ли мероприятие' })
  checkFavorite(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.favoritesService.checkFavorite(userId, eventId);
  }
}
