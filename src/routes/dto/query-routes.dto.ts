import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RouteType } from '../enums/route-type.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para filtrar el catálogo de rutas.
 *
 * Propósito: Permitir consultas de rutas por tipo, locales aliados o estado de edición limitada.
 */
export class QueryRoutesDto {
  /**
   * Filtrar por tipo de ruta.
   */
  @IsEnum(RouteType, { message: 'El tipo debe ser "predeterminada" o "evento_especial".' })
  @IsOptional()
  readonly tipo?: RouteType;

  /**
   * Filtrar solo locales aliados.
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo esLocalAliado debe ser booleano.' })
  @IsOptional()
  readonly esLocalAliado?: boolean;

  /**
   * Filtrar solo ediciones limitadas.
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo esEdicionLimitada debe ser booleano.' })
  @IsOptional()
  readonly esEdicionLimitada?: boolean;

  /**
   * Filtrar por estado activo.
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo activo debe ser booleano.' })
  @IsOptional()
  readonly activo?: boolean;

  /**
   * Búsqueda por texto en el nombre.
   */
  @IsString()
  @IsOptional()
  readonly search?: string;
}
