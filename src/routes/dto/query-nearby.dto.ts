import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la búsqueda geoespacial de rutas cercanas al usuario.
 *
 * Propósito: Validar coordenadas del usuario y radio de búsqueda máximo en kilómetros.
 */
export class QueryNearbyRoutesDto {
  /**
   * Longitud geográfica del usuario (-180 a 180).
   */
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'La longitud debe ser un número decimal.' })
  @Min(-180, { message: 'La longitud mínima es -180.' })
  @Max(180, { message: 'La longitud máxima es 180.' })
  @IsNotEmpty({ message: 'La longitud es requerida para búsqueda por cercanía.' })
  readonly longitude: number;

  /**
   * Latitud geográfica del usuario (-90 a 90).
   */
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'La latitud debe ser un número decimal.' })
  @Min(-90, { message: 'La latitud mínima es -90.' })
  @Max(90, { message: 'La latitud máxima es 90.' })
  @IsNotEmpty({ message: 'La latitud es requerida para búsqueda por cercanía.' })
  readonly latitude: number;

  /**
   * Radio de búsqueda máximo en kilómetros (por defecto 10 km).
   */
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'La distancia máxima debe ser un número.' })
  @Min(0.1, { message: 'La distancia mínima de búsqueda es 0.1 km.' })
  @Max(500, { message: 'La distancia máxima de búsqueda es 500 km.' })
  @IsOptional()
  readonly maxDistanceKm?: number = 10;
}
