import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

/**
 * Función principal que inicializa la aplicación NestJS.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend Angular (localhost:4200)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Interceptor global para trazabilidad de peticiones HTTP en consola
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Habilitar validación automática con class-validator para todos los endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de la documentación interactiva con Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Vamoo API')
    .setDescription(
      'Documentación de la API de Gamificación y Movilidad Sostenible Vamoo. ' +
        'Incluye autenticación, ligas semanales, rutas geoespaciales, salidas físicas, rachas e insignias.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa el token JWT en el formato: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticación local, OAuth de Google y perfil')
    .addTag('users', 'CRUD de usuarios, métricas de experiencia (XP) e insignias destacadas')
    .addTag('leagues', 'Grupos de ligas semanales y tabla de posiciones (leaderboard)')
    .addTag('routes', 'Catálogo de destinos, búsqueda por cercanía GPS ($near) y QR')
    .addTag('activities', 'Registro de salidas físicas, motor de bonificaciones de XP y estadísticas')
    .addTag('streaks', 'Seguimiento de constancia semanal, descansos congelados e hitos')
    .addTag('achievements', 'Medallero, condecoraciones, trofeos e insignias')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Vamoo API Docs',
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`🚀 Servidor iniciado en http://localhost:${port}`);
  logger.log(`📚 Documentación Swagger disponible en http://localhost:${port}/api/docs`);
}

await bootstrap();
