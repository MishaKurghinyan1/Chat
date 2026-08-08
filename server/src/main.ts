import 'reflect-metadata';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { getSwaggerConfig } from './configs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = getSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
