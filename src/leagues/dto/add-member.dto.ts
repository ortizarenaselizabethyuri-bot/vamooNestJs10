import { IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la incorporación de un usuario a un grupo de liga.
 *
 * Propósito: Validar que el usuario a inscribir posea un identificador ObjectId válido de MongoDB.
 */
export class AddMemberDto {
  /**
   * Identificador del usuario que se unirá al grupo de liga.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;
}
