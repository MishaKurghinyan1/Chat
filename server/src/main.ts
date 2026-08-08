import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { getSwaggerConfig } from './configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://client-production-b9fd.up.railway.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = getSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Bind to 0.0.0.0 and process.env.PORT for Railway
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();