import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Bật CORS để Frontend (cổng 3000) gọi được API
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
