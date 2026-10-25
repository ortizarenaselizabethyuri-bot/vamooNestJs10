import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutesModule } from '../routes/routes.module.js';
import { UsersModule } from '../users/users.module.js';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';
import {
  UserActivity,
  UserActivitySchema,
} from './schemas/user-activity.schema.js';

/**
 * Módulo para la gestión y registro de actividades físicas del usuario.
 *
 * Propósito: Encapsular el controlador, servicio y modelo de UserActivity,
 * integrándose con UsersModule y RoutesModule para cálculo de XP.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
    ]),
    UsersModule,
    RoutesModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService, MongooseModule],
})
export class ActivitiesModule {}
