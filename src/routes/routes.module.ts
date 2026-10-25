import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutesController } from './routes.controller.js';
import { RoutesService } from './routes.service.js';
import { Route, RouteSchema } from './schemas/route.schema.js';

/**
 * Módulo para la gestión de rutas, destinos y puntos de interés.
 *
 * Propósito: Encapsular el controlador, servicio y modelo Mongoose de rutas,
 * soportando operaciones geoespaciales y validaciones de puntos aliados.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]),
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService, MongooseModule],
})
export class RoutesModule {}
