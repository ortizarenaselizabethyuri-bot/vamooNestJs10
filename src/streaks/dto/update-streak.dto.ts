import { PartialType } from '@nestjs/mapped-types';
import { CreateStreakDto } from './create-streak.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización de una racha.
 *
 * Propósito: Permitir la actualización parcial de los datos de la racha.
 */
export class UpdateStreakDto extends PartialType(CreateStreakDto) {}
