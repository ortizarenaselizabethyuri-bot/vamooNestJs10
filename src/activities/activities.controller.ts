import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service.js';
import { CreateUserActivityDto } from './dto/create-user-activity.dto.js';
import { QueryUserActivityDto } from './dto/query-user-activity.dto.js';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto.js';
import { UserActivityDocument } from './schemas/user-activity.schema.js';

/**
 * Controlador HTTP para el registro de actividades y salidas físicas (/activities).
 *
 * Propósito: Proveer los endpoints REST para registrar salidas físicas, calcular bonificaciones,
 * consultar historial de entrenamientos y estadísticas agregadas del usuario.
 */
@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  /**
   * Inyecta la instancia del servicio de actividades.
   *
   * @param activitiesService - Servicio de lógica de negocio de actividades físicas.
   */
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Endpoint POST /activities
   *
   * Propósito: Registrar una nueva salida, evaluar bonus (primera visita a ruta, acompañamiento)
   * y acreditar automáticamente la experiencia ganada a la cuenta del usuario.
   * @param createDto - Métricas de la salida realizada.
   * @returns Promise<UserActivityDocument> Registro de la actividad creada.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar salida o actividad física',
    description:
      'Registra la salida física del usuario, computa reglas de bonus (+50 XP lugar nuevo, +20% acompañante) y acredita XP atómicamente.',
  })
  @ApiResponse({ status: 201, description: 'Actividad registrada y XP acreditada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada o IDs inválidos.' })
  async create(
    @Body() createDto: CreateUserActivityDto,
  ): Promise<UserActivityDocument> {
    return await this.activitiesService.create(createDto);
  }

  /**
   * Endpoint GET /activities
   *
   * Propósito: Consultar el historial de actividades aplicando filtros opcionales de usuario, ruta o fechas.
   * @param query - Parámetros de búsqueda.
   * @returns Promise<UserActivityDocument[]> Lista de actividades ordenadas por fecha.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar historial de actividades',
    description: 'Consulta el historial de actividades con filtros por usuarioId, rutaId o rango de fechas.',
  })
  @ApiResponse({ status: 200, description: 'Historial de actividades obtenido exitosamente.' })
  async findAll(
    @Query() query: QueryUserActivityDto,
  ): Promise<UserActivityDocument[]> {
    return await this.activitiesService.findAll(query);
  }

  /**
   * Endpoint GET /activities/stats/:userId
   *
   * Propósito: Obtener estadísticas globales de un usuario (total km caminados, número de salidas y XP sumada).
   * @param userId - Identificador del usuario (_id).
   * @returns Promise<object> Estadísticas agregadas de actividad.
   */
  @Get('stats/:userId')
  @ApiOperation({
    summary: 'Obtener estadísticas de actividad del usuario',
    description: 'Calcula total de salidas, distancia acumulada en kilómetros y XP ganada en actividades.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Estadísticas agregadas generadas correctamente.' })
  async getUserStats(@Param('userId') userId: string) {
    return await this.activitiesService.getUserStats(userId);
  }

  /**
   * Endpoint GET /activities/:id
   *
   * Propósito: Consultar el detalle completo de una actividad por su ID.
   * @param id - Identificador de la actividad (_id).
   * @returns Promise<UserActivityDocument> Documento de la actividad.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener actividad por ID',
    description: 'Devuelve los detalles de una salida física con usuario y ruta populados.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la actividad' })
  @ApiResponse({ status: 200, description: 'Actividad encontrada.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async findOne(@Param('id') id: string): Promise<UserActivityDocument> {
    return await this.activitiesService.findById(id);
  }

  /**
   * Endpoint PATCH /activities/:id
   *
   * Propósito: Actualizar parcialmente un registro de actividad existente.
   * @param id - Identificador de la actividad (_id).
   * @param updateDto - Campos a actualizar.
   * @returns Promise<UserActivityDocument> Documento de la actividad modificado.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar actividad',
    description: 'Modifica datos de una salida existente.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la actividad' })
  @ApiResponse({ status: 200, description: 'Actividad actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserActivityDto,
  ): Promise<UserActivityDocument> {
    return await this.activitiesService.update(id, updateDto);
  }

  /**
   * Endpoint DELETE /activities/:id
   *
   * Propósito: Eliminar un registro de actividad por su ID.
   * @param id - Identificador de la actividad (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar actividad',
    description: 'Borra un registro de actividad física de la colección.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la actividad' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada exitosamente.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.activitiesService.remove(id);
  }
}
