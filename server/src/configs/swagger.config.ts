import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('My Chat Application')
    .setDescription('This is my chat application')
    .setVersion('1.0')
    .addBearerAuth()
    .setContact(
      'Misha',
      'https://github.com/MishaKurghinyan1',
      'minecon291@gmail.com',
    )
    .build();
}
