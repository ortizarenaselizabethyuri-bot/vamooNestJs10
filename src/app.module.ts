import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AchievementsModule } from './achievements/achievements.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { LeaguesModule } from './leagues/leagues.module.js';
import { RoutesModule } from './routes/routes.module.js';
import { StreaksModule } from './streaks/streaks.module.js';
import { UsersModule } from './users/users.module.js';

/**
 * Módulo raíz de la aplicación.
 *
 * Propósito: Organizar los controladores, proveedores y dependencias principales de la aplicación base.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    LeaguesModule,
    RoutesModule,
    ActivitiesModule,
    StreaksModule,
    AchievementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}




