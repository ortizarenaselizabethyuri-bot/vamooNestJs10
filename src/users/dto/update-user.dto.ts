import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización de un usuario existente.
 *
 * Propósito: Permitir la actualización parcial de los campos del usuario heredando
 * las validaciones de CreateUserDto como opcionales.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
