import { ArrayMaxSize, ArrayMinSize, Equals, IsArray, IsNumber } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la ubicación geográfica en formato GeoJSON Point.
 *
 * Propósito: Validar que las coordenadas consten de exactamente dos números [longitud, latitud].
 */
export class PointLocationDto {
  /**
   * Tipo geométrico de GeoJSON, fijo en 'Point'.
   */
  @Equals('Point', { message: 'El tipo geométrico debe ser exactamente "Point".' })
  readonly type = 'Point' as const;

  /**
   * Coordenadas [longitud, latitud].
   * Primer valor: Longitud (-180 a 180).
   * Segundo valor: Latitud (-90 a 90).
   */
  @IsArray({ message: 'Las coordenadas deben enviarse en un arreglo [longitud, latitud].' })
  @ArrayMinSize(2, { message: 'Las coordenadas deben contener exactamente 2 valores.' })
  @ArrayMaxSize(2, { message: 'Las coordenadas deben contener exactamente 2 valores.' })
  @IsNumber({}, { each: true, message: 'Cada coordenada debe ser un número decimal válido.' })
  readonly coordinates: [number, number];
}
