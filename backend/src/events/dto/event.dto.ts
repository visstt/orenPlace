import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Концерт группы «Сплин»' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Описание мероприятия' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '19:00' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'ДК «Газовик», ул. Чкалова, 32' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: ['https://example.com/image.jpg'] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'uuid-category-id' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class EventQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['date', 'price', 'title'] })
  @IsString()
  @IsOptional()
  sortBy?: 'date' | 'price' | 'title';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
