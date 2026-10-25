import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { UserRank } from '../../users/enums/user-rank.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la autoasignación de un usuario a un grupo de liga.
 *
 * Propósito: Proveer los parámetros requeridos para emparejar al usuario con un grupo con cupo disponible.
 */
export class AutoAssignDto {
  /**
   * Identificador único del usuario a emparejar.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;

  /**
   * Rango de liga en el que debe ser emparejado.
   */
  @IsEnum(UserRank, {
    message: 'El rango proporcionado no es válido.',
  })
  @IsNotEmpty({ message: 'El rango es obligatorio.' })
  readonly rango: UserRank;

  /**
   * Ciclo semanal activo (ej. "2026-W43").
   */
  @IsString({ message: 'El ciclo semanal debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ciclo semanal es obligatorio.' })
  readonly cicloSemanal: string;
}
