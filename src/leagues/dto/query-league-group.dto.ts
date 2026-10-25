import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRank } from '../../users/enums/user-rank.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para filtrar consultas de grupos de liga.
 *
 * Propósito: Permitir la búsqueda de grupos según rango, ciclo semanal o estado de actividad.
 */
export class QueryLeagueGroupDto {
  /**
   * Filtrar por rango o división.
   */
  @IsEnum(UserRank, {
    message: 'El rango especificado no es válido.',
  })
  @IsOptional()
  readonly rango?: UserRank;

  /**
   * Filtrar por identificador de ciclo semanal (ej. "2026-W43").
   */
  @IsString({ message: 'El ciclo semanal debe ser una cadena de texto.' })
  @IsOptional()
  readonly cicloSemanal?: string;

  /**
   * Filtrar por estado activo/inactivo.
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El parámetro activo debe ser booleano.' })
  @IsOptional()
  readonly activo?: boolean;
}
