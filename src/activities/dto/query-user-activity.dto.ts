import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para filtrar el historial de actividades.
 *
 * Propósito: Permitir consultas de actividades por usuario, ruta o rango de fechas.
 */
export class QueryUserActivityDto {
  /**
   * Filtrar por identificador de usuario.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido.' })
  @IsOptional()
  readonly usuarioId?: string;

  /**
   * Filtrar por identificador de ruta completada.
   */
  @IsMongoId({ message: 'El rutaId debe ser un ObjectId válido.' })
  @IsOptional()
  readonly rutaId?: string;

  /**
   * Fecha de inicio para filtrado de historial (ISO 8601).
   */
  @IsDateString({}, { message: 'La fechaInicio debe tener formato ISO 8601.' })
  @IsOptional()
  readonly fechaInicio?: string;

  /**
   * Fecha de fin para filtrado de historial (ISO 8601).
   */
  @IsDateString({}, { message: 'La fechaFin debe tener formato ISO 8601.' })
  @IsOptional()
  readonly fechaFin?: string;
}
