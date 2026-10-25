import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación de un registro de racha.
 *
 * Propósito: Validar los datos de inicialización de la constancia del usuario.
 */
export class CreateStreakDto {
  /**
   * Identificador único del usuario al que pertenece la racha.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;

  /**
   * Semanas consecutivas iniciales (por defecto 0).
   */
  @IsNumber({}, { message: 'Las semanas consecutivas deben ser un número.' })
  @Min(0, { message: 'Las semanas consecutivas no pueden ser negativas.' })
  @IsOptional()
  readonly semanasConsecutivas?: number;

  /**
   * Salidas válidas registradas en la semana actual.
   */
  @IsNumber({}, { message: 'Las salidas válidas deben ser un número.' })
  @Min(0, { message: 'Las salidas válidas no pueden ser negativas.' })
  @IsOptional()
  readonly salidasValidasSemana?: number;

  /**
   * Meta de salidas requeridas por semana (por defecto 3).
   */
  @IsNumber({}, { message: 'La meta semanal debe ser un número.' })
  @Min(1, { message: 'La meta semanal debe ser al menos 1.' })
  @IsOptional()
  readonly metaSemanal?: number;

  /**
   * Identificador del ciclo semanal actual (ej. "2026-W43").
   */
  @IsString({ message: 'La semana actual debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La semana actual es obligatoria.' })
  readonly semanaActual: string;

  /**
   * Días o comodines de descanso restantes (por defecto 2).
   */
  @IsNumber({}, { message: 'Los días de descanso deben ser un número.' })
  @Min(0, { message: 'Los días de descanso no pueden ser negativos.' })
  @IsOptional()
  readonly diasDescansoRestantes?: number;

  /**
   * Estado de congelamiento de la racha.
   */
  @IsBoolean({ message: 'El campo congelada debe ser un booleano.' })
  @IsOptional()
  readonly congelada?: boolean;

  /**
   * Hitos alcanzados por el usuario (ej. [4, 12, 24]).
   */
  @IsArray({ message: 'Los hitos deben ser un arreglo de números.' })
  @IsNumber({}, { each: true, message: 'Cada hito debe ser un número entero.' })
  @IsOptional()
  readonly hitosAlcanzados?: number[];
}
