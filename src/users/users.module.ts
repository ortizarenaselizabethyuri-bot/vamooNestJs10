import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

/**
 * Módulo de gestión de usuarios.
 *
 * Propósito: Encapsular el modelo de Mongoose, el controlador y el servicio
 * de la entidad User, exportando UsersService para futuros módulos como autenticación (Auth/JWT/Google).
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
