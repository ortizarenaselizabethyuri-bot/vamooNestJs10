import { IsOptional, IsString } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para registrar una salida válida en la racha semanal.
 *
 * Propósito: Proveer opcionalmente el identificador de la semana a la que computa la salida.
 */
export class RecordOutingDto {
  /**
   * Ciclo semanal correspondiente (ej. "2026-W43").
   * Si no se envía, el servicio calculará automáticamente el ciclo actual.
   */
  @IsString({ message: 'El ciclo semanal debe ser una cadena de texto.' })
  @IsOptional()
  readonly semanaActual?: string;
}
