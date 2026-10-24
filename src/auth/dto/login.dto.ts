import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para el inicio de sesión con email y contraseña.
 *
 * Propósito: Validar el formato de correo y la presencia de la contraseña para autenticación local.
 */
export class LoginDto {
  /**
   * Correo electrónico registrado del usuario.
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  readonly email: string;

  /**
   * Contraseña de la cuenta.
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  readonly password: string;
}
