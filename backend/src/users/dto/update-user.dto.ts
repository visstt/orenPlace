import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Иван' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiPropertyOptional({ example: 'test@orenplace.ru' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+79123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Оренбург' })
  @IsString()
  @IsOptional()
  city?: string;
}
