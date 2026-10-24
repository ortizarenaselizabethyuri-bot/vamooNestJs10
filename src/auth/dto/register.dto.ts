import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para el registro de nuevos usuarios mediante credenciales locales.
 *
 * Propósito: Validar que el nombre, correo y contraseña cumplan los requisitos mínimos de seguridad.
 */
export class RegisterDto {
  /**
   * Nombre completo del usuario.
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  readonly name: string;

  /**
   * Correo electrónico único del usuario.
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  readonly email: string;

  /**
   * Contraseña en texto plano que será hasheada antes de almacenarse.
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  readonly password: string;
}
