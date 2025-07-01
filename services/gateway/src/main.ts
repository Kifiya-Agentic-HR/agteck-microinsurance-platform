import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Gateway API')
  .setDescription('API documentation for the gateway microservice')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    },
    'access-token', // This is the name used in @ApiBearerAuth()
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Swagger UI at /api/docs

  app.enableCors(); // Enable CORS with default settings

  const port = process.env.NEXT_PUBLIC_GATEWAY_PORT || 7000;
  await app.listen(port);
  console.log(`Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
