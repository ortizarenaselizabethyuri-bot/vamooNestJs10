import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { RouteType } from '../enums/route-type.enum.js';
import { PointLocationDto } from './point-location.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación de un nuevo destino o ruta.
 *
 * Propósito: Validar campos obligatorios de nombre, ubicación GPS y parámetros de gamificación.
 */
export class CreateRouteDto {
  /**
   * Nombre de la ruta o punto de interés.
   */
  @IsString({ message: 'El nombre de la ruta debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la ruta es obligatorio.' })
  readonly nombre: string;

  /**
   * Descripción detallada del sitio o recomendaciones para el usuario.
   */
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  readonly descripcion?: string;

  /**
   * Tipo de ruta (predeterminada o evento_especial).
   */
  @IsEnum(RouteType, {
    message: 'El tipo debe ser "predeterminada" o "evento_especial".',
  })
  @IsOptional()
  readonly tipo?: RouteType;

  /**
   * Puntos de experiencia (XP) otorgados (ej. 100 para predeterminada, 150 para especial).
   */
  @IsNumber({}, { message: 'El valor de xpOtorgada debe ser un número.' })
  @Min(0, { message: 'La experiencia otorgada no puede ser negativa.' })
  @IsOptional()
  readonly xpOtorgada?: number;

  /**
   * Ubicación GeoJSON Point con coordenadas [longitud, latitud].
   */
  @ValidateNested()
  @Type(() => PointLocationDto)
  @IsNotEmpty({ message: 'La ubicación geográfica es obligatoria.' })
  readonly ubicacion: PointLocationDto;

  /**
   * Tiempo mínimo recomendado o requerido de permanencia en minutos.
   */
  @IsNumber({}, { message: 'El tiempo mínimo debe ser un número entero en minutos.' })
  @Min(0, { message: 'El tiempo mínimo no puede ser negativo.' })
  @IsOptional()
  readonly tiempoMinimoMinutos?: number;

  /**
   * Indica si la parada es un establecimiento o local aliado.
   */
  @IsBoolean({ message: 'El campo esLocalAliado debe ser un valor booleano.' })
  @IsOptional()
  readonly esLocalAliado?: boolean;

  /**
   * Código QR único asignado al establecimiento aliado para validación presencial.
   */
  @IsString({ message: 'El código QR debe ser una cadena de texto.' })
  @IsOptional()
  readonly codigoQR?: string;

  /**
   * Indica si es una ruta por tiempo limitado o temporada.
   */
  @IsBoolean({ message: 'El campo esEdicionLimitada debe ser un valor booleano.' })
  @IsOptional()
  readonly esEdicionLimitada?: boolean;

  /**
   * Disponibilidad pública de la ruta.
   */
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @IsOptional()
  readonly activo?: boolean;
}
