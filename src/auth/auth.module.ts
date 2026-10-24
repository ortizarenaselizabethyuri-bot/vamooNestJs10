import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

/**
 * Módulo de autenticación (AuthModule).
 *
 * Propósito: Configurar Passport, JWT y Google OAuth 2.0, e integrar
 * las estrategias de autenticación con el servicio de usuarios (UsersModule).
 */
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      /**
       * Fábrica de configuración asíncrona para JWT.
       *
       * @param configService - Servicio para leer variables de entorno (JWT_SECRET, JWT_EXPIRES_IN).
       * @returns Opciones de firma y clave secreta para JwtModule.
       */
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'clave_secreta_jwt_temporal_por_favor_cambiar_en_env',
        ),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN', '7d') ?? '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
