import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutesModule } from '../routes/routes.module.js';
import { UsersModule } from '../users/users.module.js';
import { AchievementsController } from './achievements.controller.js';
import { AchievementsService } from './achievements.service.js';
import {
  Achievement,
  AchievementSchema,
} from './schemas/achievement.schema.js';

/**
 * Módulo para la gestión y concesión de insignias y trofeos.
 *
 * Propósito: Encapsular el modelo de Mongoose, el controlador y el servicio de condecoraciones,
 * comunicándose con UsersModule y RoutesModule.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
    ]),
    UsersModule,
    RoutesModule,
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService, MongooseModule],
})
export class AchievementsModule {}
