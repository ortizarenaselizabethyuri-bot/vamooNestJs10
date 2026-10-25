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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStreakDto } from './dto/create-streak.dto.js';
import { RecordOutingDto } from './dto/record-outing.dto.js';
import { UpdateStreakDto } from './dto/update-streak.dto.js';
import { StreakDocument } from './schemas/streak.schema.js';
import { StreaksService } from './streaks.service.js';

/**
 * Controlador HTTP para la gestión de constancia y rachas semanales (/streaks).
 *
 * Propósito: Exponer los endpoints REST para consultar la racha del usuario,
 * registrar salidas válidas, congelar/descongelar semanas y monitorear hitos de constancia.
 */
@ApiTags('streaks')
@Controller('streaks')
export class StreaksController {
  /**
   * Inyecta la instancia del servicio de rachas.
   *
   * @param streaksService - Servicio de lógica de negocio de rachas.
   */
  constructor(private readonly streaksService: StreaksService) {}

  /**
   * Endpoint POST /streaks
   *
   * Propósito: Crear manualmente un registro de racha para un usuario.
   * @param createDto - Parámetros de inicialización de la racha.
   * @returns Promise<StreakDocument> Documento de la racha creada.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear registro de racha',
    description: 'Inicializa manualmente el estado de constancia para un usuario.',
  })
  @ApiResponse({ status: 201, description: 'Racha creada exitosamente.' })
  @ApiResponse({ status: 409, description: 'El usuario ya cuenta con un registro de racha.' })
  async create(@Body() createDto: CreateStreakDto): Promise<StreakDocument> {
    return await this.streaksService.create(createDto);
  }

  /**
   * Endpoint GET /streaks
   *
   * Propósito: Listar las rachas de todos los usuarios ordenadas por semanas consecutivas descendente.
   * @returns Promise<StreakDocument[]> Arreglo de rachas.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todas las rachas',
    description: 'Devuelve las rachas ordenadas por semanas consecutivas en orden descendente.',
  })
  @ApiResponse({ status: 200, description: 'Listado de rachas obtenido correctamente.' })
  async findAll(): Promise<StreakDocument[]> {
    return await this.streaksService.findAll();
  }

  /**
   * Endpoint GET /streaks/user/:userId
   *
   * Propósito: Obtener o inicializar la racha del usuario en el ciclo semanal actual.
   * @param userId - Identificador único del usuario (_id).
   * @returns Promise<StreakDocument> Estado de la racha del usuario.
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener o inicializar racha de usuario',
    description: 'Retorna la racha del usuario procesando automáticamente transiciones semanales pendientes.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Racha del usuario obtenida exitosamente.' })
  async findByUser(@Param('userId') userId: string): Promise<StreakDocument> {
    return await this.streaksService.findByUserId(userId);
  }

  /**
   * Endpoint POST /streaks/user/:userId/record-outing
   *
   * Propósito: Registrar una salida física válida en la racha semanal del usuario.
   * @param userId - Identificador del usuario.
   * @param recordDto - Datos opcionales del ciclo semanal.
   * @returns Promise<StreakDocument> Racha actualizada con la salida y posibles hitos.
   */
  @Post('user/:userId/record-outing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar salida válida en racha',
    description: 'Incrementa las salidas de la semana. Al alcanzar la meta (3 salidas), consolida la semana y evalúa hitos.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Salida contabilizada en la racha.' })
  async recordOuting(
    @Param('userId') userId: string,
    @Body() recordDto: RecordOutingDto,
  ): Promise<StreakDocument> {
    return await this.streaksService.recordValidOuting(
      userId,
      recordDto.semanaActual,
    );
  }

  /**
   * Endpoint POST /streaks/user/:userId/freeze
   *
   * Propósito: Congelar la racha del usuario para protegerla durante la semana activa.
   * @param userId - Identificador del usuario.
   * @returns Promise<StreakDocument> Racha congelada.
   */
  @Post('user/:userId/freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Congelar racha semanal',
    description: 'Consume un día de descanso para proteger la racha activa durante el ciclo semanal en curso.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Racha congelada con éxito.' })
  @ApiResponse({ status: 400, description: 'No dispone de días de descanso o ya está congelada.' })
  async freezeStreak(
    @Param('userId') userId: string,
  ): Promise<StreakDocument> {
    return await this.streaksService.freezeStreak(userId);
  }

  /**
   * Endpoint POST /streaks/user/:userId/unfreeze
   *
   * Propósito: Descongelar voluntariamente la racha del usuario.
   * @param userId - Identificador del usuario.
   * @returns Promise<StreakDocument> Racha reactivada.
   */
  @Post('user/:userId/unfreeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Descongelar racha semanal',
    description: 'Reactiva la exigencia normal de salidas para la semana.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Racha reactivada con éxito.' })
  @ApiResponse({ status: 400, description: 'La racha no se encontraba congelada.' })
  async unfreezeStreak(
    @Param('userId') userId: string,
  ): Promise<StreakDocument> {
    return await this.streaksService.unfreezeStreak(userId);
  }

  /**
   * Endpoint GET /streaks/:id
   *
   * Propósito: Consultar el detalle de una racha por su ID único de MongoDB.
   * @param id - Identificador de la racha (_id).
   * @returns Promise<StreakDocument> Documento de la racha.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener racha por ID',
    description: 'Recupera los detalles de una racha mediante su identificador único.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la racha' })
  @ApiResponse({ status: 200, description: 'Racha encontrada.' })
  @ApiResponse({ status: 404, description: 'Racha no encontrada.' })
  async findOne(@Param('id') id: string): Promise<StreakDocument> {
    return await this.streaksService.findById(id);
  }

  /**
   * Endpoint PATCH /streaks/:id
   *
   * Propósito: Actualizar parcialmente las propiedades de una racha.
   * @param id - Identificador de la racha (_id).
   * @param updateDto - Campos a modificar.
   * @returns Promise<StreakDocument> Racha actualizada.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar racha',
    description: 'Modifica parámetros específicos de una racha.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la racha' })
  @ApiResponse({ status: 200, description: 'Racha actualizada.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStreakDto,
  ): Promise<StreakDocument> {
    return await this.streaksService.update(id, updateDto);
  }

  /**
   * Endpoint DELETE /streaks/:id
   *
   * Propósito: Eliminar un registro de racha por su ID.
   * @param id - Identificador de la racha (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar racha',
    description: 'Remueve un registro de racha de la colección.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la racha' })
  @ApiResponse({ status: 200, description: 'Racha eliminada exitosamente.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.streaksService.remove(id);
  }
}
