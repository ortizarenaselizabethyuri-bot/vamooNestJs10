import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización parcial de rutas.
 *
 * Propósito: Permitir la modificación de campos existentes heredando validaciones de CreateRouteDto.
 */
export class UpdateRouteDto extends PartialType(CreateRouteDto) {}
