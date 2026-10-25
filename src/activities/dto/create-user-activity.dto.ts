import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para registrar una nueva actividad o salida del usuario.
 *
 * Propósito: Validar las métricas de la salida (distancia, duración, validaciones GPS/QR y acompañamiento).
 */
export class CreateUserActivityDto {
  /**
   * Identificador del usuario que realiza la actividad.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId de MongoDB válido.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;

  /**
   * Identificador de la ruta completada (opcional en caso de caminata libre).
   */
  @IsMongoId({ message: 'El rutaId debe ser un ObjectId de MongoDB válido.' })
  @IsOptional()
  readonly rutaId?: string;

  /**
   * Distancia recorrida en kilómetros.
   */
  @IsNumber({}, { message: 'La distancia debe ser un número decimal en kilómetros.' })
  @Min(0, { message: 'La distancia no puede ser negativa.' })
  @IsNotEmpty({ message: 'La distancia en kilómetros es obligatoria.' })
  readonly distanciaKm: number;

  /**
   * Duración en minutos de la actividad.
   */
  @IsNumber({}, { message: 'La duración debe ser un número entero en minutos.' })
  @Min(0, { message: 'La duración no puede ser negativa.' })
  @IsOptional()
  readonly duracionMinutos?: number;

  /**
   * Indica si la actividad fue realizada con un compañero (+20% bonus de XP).
   */
  @IsBoolean({ message: 'El campo acompanado debe ser booleano.' })
  @IsOptional()
  readonly acompanado?: boolean;

  /**
   * Indica si la actividad cuenta con validación por coordenadas GPS.
   */
  @IsBoolean({ message: 'El campo validadoPorGPS debe ser booleano.' })
  @IsOptional()
  readonly validadoPorGPS?: boolean;

  /**
   * Indica si la actividad cuenta con validación por lectura de código QR.
   */
  @IsBoolean({ message: 'El campo validadoPorQR debe ser booleano.' })
  @IsOptional()
  readonly validadoPorQR?: boolean;

  /**
   * Fecha de realización de la actividad (opcional, por defecto fecha y hora actual).
   */
  @IsDateString({}, { message: 'La fecha debe tener un formato ISO 8601 válido.' })
  @IsOptional()
  readonly fecha?: string;
}
