import { IsNotEmpty, IsNumber, Min } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la adición de puntos de experiencia (XP).
 *
 * Propósito: Validar que el valor de XP a sumar sea un número positivo y obligatorio.
 */
export class AddXpDto {
  /**
   * Cantidad de puntos de experiencia (XP) a otorgar al usuario.
   */
  @IsNumber({}, { message: 'El valor de XP debe ser un número.' })
  @Min(1, { message: 'El valor de XP a sumar debe ser mínimo 1.' })
  @IsNotEmpty({ message: 'El campo xp es obligatorio.' })
  readonly xp: number;
}
