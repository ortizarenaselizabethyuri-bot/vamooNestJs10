import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para actualizar las insignias destacadas del perfil.
 *
 * Propósito: Validar que el usuario envíe una lista de hasta 3 ObjectIds de MongoDB correspondientes a insignias.
 */
export class UpdateFeaturedBadgesDto {
  /**
   * Arreglo con hasta 3 identificadores de insignias para mostrar en el perfil del usuario.
   */
  @IsArray({ message: 'Las insignias destacadas deben enviarse como un arreglo.' })
  @ArrayMaxSize(3, { message: 'Solo puedes destacar un máximo de 3 insignias.' })
  @IsMongoId({ each: true, message: 'Cada elemento debe ser un ObjectId de insignia válido.' })
  readonly badgeIds: string[];
}
