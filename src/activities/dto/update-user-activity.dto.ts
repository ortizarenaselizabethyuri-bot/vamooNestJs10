import { PartialType } from '@nestjs/mapped-types';
import { CreateUserActivityDto } from './create-user-activity.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización de un registro de actividad existente.
 *
 * Propósito: Permitir modificaciones parciales sobre actividades heredando validaciones de CreateUserActivityDto.
 */
export class UpdateUserActivityDto extends PartialType(CreateUserActivityDto) {}
