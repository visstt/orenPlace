import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

function ensureEnv() {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
  }

  const missing = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'].filter(
    (key) => !process.env[key],
  );

  if (missing.length > 0) {
    console.error(
      `\n✗ Не заданы переменные в backend/.env: ${missing.join(', ')}\n` +
        '  Скопируйте файл: cp .env.example .env\n',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  ensureEnv();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Разрешить запросы со всех адресов
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Куда сходить в Оренбурге — API')
    .setDescription('REST API для мобильного приложения')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Сервер запущен на http://0.0.0.0:${port}`);
  console.log(`📄 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
