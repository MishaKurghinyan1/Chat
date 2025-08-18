import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from 'src/configs/swagger.config';

export function setupSwagger(app: INestApplication) {
  const config = getSwaggerConfig();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // This allows the authorization to persist across requests, which means you don't have to re-enter it for every request.
      displayRequestDuration: true, // This will display the request duration in the Swagger UI. which means you can see how long each request takes.
      defaultModelsExpandDepth: 0, // This will set the default models expand depth to 1, which means that the models will be expanded by default in the Swagger UI. If you set it to -1, it will not expand any models by default.
      docExpansion: 'none', // This will collapse all the sections in the Swagger UI by default, which means you can expand them as needed.
      filter: true, // This will enable the filter functionality in the Swagger UI, which means you can filter the endpoints by their tags or paths.
      showExtensions: true, // This will show the extensions in the Swagger UI, which means you can see the custom extensions that you have added to your endpoints.
      showCommonExtensions: true, // This will show the common extensions in the Swagger UI, which means you can see the common extensions that are used in the Swagger UI. common extensions are used to add additional information to the endpoints, such as the response codes, the request body, and the response body.
      tryItOutEnabled: false, // This will enable the "Try it out" functionality in the Swagger UI, which means you can test the endpoints directly from the Swagger UI.
    },
  });
}
