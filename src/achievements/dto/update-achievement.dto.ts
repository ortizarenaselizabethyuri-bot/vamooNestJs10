import { PartialType } from '@nestjs/mapped-types';
import { CreateAchievementDto } from './create-achievement.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para actualizar un logro existente.
 *
 * Propósito: Permitir modificaciones sobre insignias o trofeos creados.
 */
export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {}
