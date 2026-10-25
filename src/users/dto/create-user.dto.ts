import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { UserRank } from '../enums/user-rank.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación de un nuevo usuario.
 *
 * Propósito: Validar y tipar los datos recibidos en las solicitudes de registro o creación de usuarios.
 */
export class CreateUserDto {
  /**
   * Nombre del usuario.
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe contener al menos 2 caracteres.' })
  readonly name: string;

  /**
   * Correo electrónico del usuario.
   */
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  readonly email: string;

  /**
   * Contraseña para inicio de sesión local.
   * Opcional en caso de registro con proveedores OAuth como Google.
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe contener al menos 6 caracteres.' })
  readonly password?: string;

  /**
   * URL de la foto de perfil del usuario.
   */
  @IsString({ message: 'La foto de perfil debe ser una URL válida.' })
  @IsOptional()
  readonly picture?: string;

  /**
   * ID único de Google provisto en el flujo OAuth.
   */
  @IsString({ message: 'El ID de Google debe ser una cadena de texto.' })
  @IsOptional()
  readonly googleId?: string;

  /**
   * Roles asignados al usuario en la plataforma.
   */
  @IsArray({ message: 'Los roles deben proporcionarse en un arreglo.' })
  @IsString({ each: true, message: 'Cada rol debe ser una cadena de texto.' })
  @IsOptional()
  readonly roles?: string[];

  /**
   * Indica si la cuenta está activa.
   */
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  readonly isActive?: boolean;

  /**
   * Rango o división de liga del usuario.
   */
  @IsEnum(UserRank, {
    message:
      'El rango debe ser uno de los válidos: Pichón, Pingüino, Flamenco, Oso de anteojos, Tortuga marina, Bagre dorado.',
  })
  @IsOptional()
  readonly currentRank?: UserRank;

  /**
   * Total de XP acumulado históricamente.
   */
  @IsNumber({}, { message: 'El total de XP debe ser un número.' })
  @Min(0, { message: 'El total de XP no puede ser negativo.' })
  @IsOptional()
  readonly totalXp?: number;

  /**
   * Puntos de XP obtenidos en el ciclo semanal actual.
   */
  @IsNumber({}, { message: 'El XP de liga debe ser un número.' })
  @Min(0, { message: 'El XP de liga no puede ser negativo.' })
  @IsOptional()
  readonly leagueXp?: number;

  /**
   * Indica si el usuario está en pausa de la liga semanal.
   */
  @IsBoolean({ message: 'El estado de pausa debe ser un valor booleano.' })
  @IsOptional()
  readonly isPaused?: boolean;

  /**
   * Arreglo de hasta 3 identificadores de insignias destacadas.
   */
  @IsArray({ message: 'Las insignias destacadas deben ser un arreglo.' })
  @ArrayMaxSize(3, { message: 'Solo se pueden destacar un máximo de 3 insignias.' })
  @IsMongoId({ each: true, message: 'Cada insignia debe ser un ObjectId válido.' })
  @IsOptional()
  readonly featuredBadges?: string[];

  /**
   * Identificador del grupo de liga semanal asignado.
   */
  @IsMongoId({ message: 'El ID del grupo de liga debe ser un ObjectId válido.' })
  @IsOptional()
  readonly currentLeagueGroupId?: string;
}
