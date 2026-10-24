import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Función principal que arranca la aplicación NestJS.
 *
 * Propósito: Configurar e iniciar la instancia HTTP de NestJS en el puerto especificado.
 * Parámetros: Ninguno.
 * Retorno: Promise<void> que se resuelve cuando el servidor está en ejecución.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

await bootstrap();

