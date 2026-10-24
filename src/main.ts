import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Función principal que arranca la aplicación NestJS.
 *
 * Propósito: Configurar e iniciar la instancia HTTP de NestJS en el puerto especificado desde variables de entorno.
 * Parámetros: Ninguno.
 * Retorno: Promise<void> que se resuelve cuando el servidor está en ejecución.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`🚀 Servidor iniciado en http://localhost:${port}`);
}

await bootstrap();


