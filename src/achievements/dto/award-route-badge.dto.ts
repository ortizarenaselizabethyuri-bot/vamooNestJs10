import { IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para otorgar automáticamente una insignia por ruta completada.
 *
 * Propósito: Validar que se envíen identificadores válidos para el usuario y la ruta completada.
 */
export class AwardRouteBadgeDto {
  /**
   * Identificador del usuario que completó la ruta.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;

  /**
   * Identificador de la ruta completada.
   */
  @IsMongoId({ message: 'El rutaId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El rutaId es obligatorio.' })
  readonly rutaId: string;
}
