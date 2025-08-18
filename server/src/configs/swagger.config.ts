import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Nest Course')
    .setDescription('This is a course for NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .setContact(
      'Misha',
      'https://github.com/MishalHamed',
      'minecon291@gmail.com',
    )
    .build();
}
