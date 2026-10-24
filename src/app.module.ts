import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

/**
 * Módulo raíz de la aplicación.
 *
 * Propósito: Organizar los controladores, proveedores y dependencias de la aplicación base.
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

