import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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
}
