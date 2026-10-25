import { PartialType } from '@nestjs/mapped-types';
import { CreateLeagueGroupDto } from './create-league-group.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización de un grupo de liga existente.
 *
 * Propósito: Permitir la actualización parcial de los campos heredando las validaciones de CreateLeagueGroupDto.
 */
export class UpdateLeagueGroupDto extends PartialType(CreateLeagueGroupDto) {}
