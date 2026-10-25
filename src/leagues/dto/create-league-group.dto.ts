import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UserRank } from '../../users/enums/user-rank.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación de un nuevo grupo de liga semanal.
 *
 * Propósito: Validar los datos necesarios para inicializar un grupo de liga en un ciclo específico.
 */
export class CreateLeagueGroupDto {
  /**
   * Rango o división competitiva del grupo.
   */
  @IsEnum(UserRank, {
    message:
      'El rango debe ser uno de los válidos: Pichón, Pingüino, Flamenco, Oso de anteojos, Tortuga marina, Bagre dorado.',
  })
  @IsNotEmpty({ message: 'El rango es obligatorio.' })
  readonly rango: UserRank;

  /**
   * Código o identificador del ciclo semanal (ej. "2026-W43").
   */
  @IsString({ message: 'El ciclo semanal debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ciclo semanal es obligatorio.' })
  readonly cicloSemanal: string;

  /**
   * Lista inicial de identificadores de usuarios a incluir en el grupo (opcional).
   */
  @IsArray({ message: 'Los miembros deben suministrarse en un arreglo.' })
  @ArrayMaxSize(30, { message: 'El grupo no puede exceder el límite de 30 miembros.' })
  @IsMongoId({ each: true, message: 'Cada miembro debe ser un ObjectId válido de usuario.' })
  @IsOptional()
  readonly miembros?: string[];

  /**
   * Capacidad límite de miembros (por defecto 30).
   */
  @IsNumber({}, { message: 'El límite de miembros debe ser un número.' })
  @Min(1, { message: 'El límite de miembros debe ser al menos 1.' })
  @IsOptional()
  readonly limiteMiembros?: number;

  /**
   * Estado de actividad del grupo.
   */
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  readonly activo?: boolean;
}
