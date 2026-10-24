import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

/**
 * Módulo encargado de gestionar la conexión con MongoDB.
 *
 * Propósito: Configurar de forma asíncrona la conexión a la base de datos MongoDB
 * utilizando las variables de entorno provistas a través del ConfigService.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      /**
       * Fábrica de configuración para la conexión con MongoDB.
       *
       * Propósito: Proveer la URI y opciones de Mongoose dinámicamente desde el entorno.
       * @param configService - Instancia del servicio de configuración para leer variables de entorno.
       * @returns Configuración de conexión para Mongoose con uri y dbName.
       */
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/vamooNestJs10',
        ),
        dbName: configService.get<string>('MONGODB_DB_NAME', 'vamooNestJs10'),
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
