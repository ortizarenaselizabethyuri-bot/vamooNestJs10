import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { AchievementCategory } from '../enums/achievement-category.enum.js';
import { AchievementType } from '../enums/achievement-type.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para filtrar el listado de logros e insignias.
 *
 * Propósito: Permitir consultas por usuario, tipo, categoría y filtro de edición limitada.
 */
export class QueryAchievementDto {
  /**
   * Filtrar por identificador de usuario.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido.' })
  @IsOptional()
  readonly usuarioId?: string;

  /**
   * Filtrar por tipo (insignia o trofeo).
   */
  @IsEnum(AchievementType, { message: 'El tipo especificado no es válido.' })
  @IsOptional()
  readonly tipo?: AchievementType;

  /**
   * Filtrar por categoría temática.
   */
  @IsEnum(AchievementCategory, { message: 'La categoría especificada no es válida.' })
  @IsOptional()
  readonly categoria?: AchievementCategory;

  /**
   * Filtrar solo ediciones limitadas.
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo esEdicionLimitada debe ser booleano.' })
  @IsOptional()
  readonly esEdicionLimitada?: boolean;
}
