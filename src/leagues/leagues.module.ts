import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { LeaguesController } from './leagues.controller.js';
import { LeaguesService } from './leagues.service.js';
import {
  LeagueGroup,
  LeagueGroupSchema,
} from './schemas/league-group.schema.js';

/**
 * Módulo para la gestión de ligas semanales y rankings.
 *
 * Propósito: Encapsular el controlador, servicio y esquemas requeridos
 * para la administración de grupos de liga y emparejamiento de usuarios.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeagueGroup.name, schema: LeagueGroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService],
  exports: [LeaguesService, MongooseModule],
})
export class LeaguesModule {}
