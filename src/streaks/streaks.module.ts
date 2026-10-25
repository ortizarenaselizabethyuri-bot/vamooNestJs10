import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module.js';
import { Streak, StreakSchema } from './schemas/streak.schema.js';
import { StreaksController } from './streaks.controller.js';
import { StreaksService } from './streaks.service.js';

/**
 * Módulo para la gestión de constancia y rachas semanales.
 *
 * Propósito: Encapsular el modelo de Mongoose, el controlador y el servicio de Streak,
 * interactuando con UsersModule para la verificación y protección de rachas.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Streak.name, schema: StreakSchema }]),
    UsersModule,
  ],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService, MongooseModule],
})
export class StreaksModule {}
