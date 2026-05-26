import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'Алексей' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin2@orenplace.ru' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass1' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminUsersQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
