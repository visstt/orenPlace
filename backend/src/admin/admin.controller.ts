import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateAdminUserDto, AdminUsersQueryDto } from './dto/admin.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Админ-панель')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Список пользователей' })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Post('admins')
  @ApiOperation({ summary: 'Создать администратора или выдать права существующему' })
  createAdmin(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createAdmin(dto);
  }

  @Get('analytics/attendance')
  @ApiOperation({ summary: 'Статистика продаж билетов для графиков' })
  attendance() {
    return this.adminService.getAttendanceAnalytics();
  }
}
