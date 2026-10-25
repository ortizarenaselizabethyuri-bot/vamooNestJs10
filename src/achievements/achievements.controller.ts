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
import { AchievementsService } from './achievements.service.js';
import { AwardRouteBadgeDto } from './dto/award-route-badge.dto.js';
import { CreateAchievementDto } from './dto/create-achievement.dto.js';
import { QueryAchievementDto } from './dto/query-achievement.dto.js';
import { UpdateAchievementDto } from './dto/update-achievement.dto.js';
import { AchievementDocument } from './schemas/achievement.schema.js';

/**
 * Controlador HTTP para el recurso de insignias y trofeos (/achievements).
 *
 * Propósito: Exponer los endpoints REST para otorgar condecoraciones,
 * consultar el medallero del usuario y administrar logros del sistema.
 */
@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  /**
   * Inyecta la instancia del servicio de logros.
   *
   * @param achievementsService - Servicio de lógica de negocio de logros.
   */
  constructor(private readonly achievementsService: AchievementsService) {}

  /**
   * Endpoint POST /achievements
   *
   * Propósito: Otorgar o crear manualmente una nueva insignia o trofeo a un usuario.
   * @param createDto - Parámetros de la condecoración.
   * @returns Promise<AchievementDocument> Registro del logro otorgado.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Otorgar o crear logro',
    description: 'Concede una insignia o trofeo a un usuario previniendo duplicados idénticos.',
  })
  @ApiResponse({ status: 201, description: 'Logro otorgado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El usuario ya posee esta condecoración.' })
  async create(
    @Body() createDto: CreateAchievementDto,
  ): Promise<AchievementDocument> {
    return await this.achievementsService.create(createDto);
  }

  /**
   * Endpoint POST /achievements/award/route
   *
   * Propósito: Otorgar la insignia correspondiente al usuario por completar una ruta.
   * @param awardDto - Parámetros con usuarioId y rutaId.
   * @returns Promise<AchievementDocument | null> Insignia otorgada o null si ya la poseía.
   */
  @Post('award/route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Otorgar insignia por ruta completada',
    description: 'Crea automáticamente la insignia asociada a una ruta completada para el usuario.',
  })
  @ApiResponse({ status: 200, description: 'Insignia otorgada o verificada si ya existía.' })
  async awardRouteBadge(
    @Body() awardDto: AwardRouteBadgeDto,
  ): Promise<AchievementDocument | null> {
    return await this.achievementsService.awardBadgeForRoute(
      awardDto.usuarioId,
      awardDto.rutaId,
    );
  }

  /**
   * Endpoint GET /achievements
   *
   * Propósito: Consultar logros aplicando filtros opcionales de usuario, tipo o categoría.
   * @param query - Parámetros de búsqueda.
   * @returns Promise<AchievementDocument[]> Lista de logros encontrados.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar logros',
    description: 'Obtiene las condecoraciones con filtros opcionales por usuario, tipo o categoría.',
  })
  @ApiResponse({ status: 200, description: 'Listado de logros obtenido correctamente.' })
  async findAll(
    @Query() query: QueryAchievementDto,
  ): Promise<AchievementDocument[]> {
    return await this.achievementsService.findAll(query);
  }

  /**
   * Endpoint GET /achievements/user/:userId
   *
   * Propósito: Consultar todo el medallero (vitrina de insignias y trofeos) de un usuario.
   * @param userId - Identificador único del usuario (_id).
   * @returns Promise<AchievementDocument[]> Condecoraciones del usuario.
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener medallero de un usuario',
    description: 'Devuelve todas las insignias y trofeos obtenidos por un usuario para su vitrina pública.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Medallero obtenido con éxito.' })
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<AchievementDocument[]> {
    return await this.achievementsService.findByUser(userId);
  }

  /**
   * Endpoint GET /achievements/:id
   *
   * Propósito: Consultar el detalle de una condecoración por su ID único.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<AchievementDocument> Documento del logro.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener logro por ID',
    description: 'Devuelve la información de un logro con referencias de usuario y ruta populadas.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del logro' })
  @ApiResponse({ status: 200, description: 'Logro encontrado.' })
  @ApiResponse({ status: 404, description: 'Logro no encontrado.' })
  async findOne(@Param('id') id: string): Promise<AchievementDocument> {
    return await this.achievementsService.findById(id);
  }

  /**
   * Endpoint PATCH /achievements/:id
   *
   * Propósito: Actualizar parcialmente la información de un logro existente.
   * @param id - Identificador del logro (_id).
   * @param updateDto - Campos a modificar.
   * @returns Promise<AchievementDocument> Documento actualizado.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar logro',
    description: 'Modifica datos de una insignia o trofeo existente.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del logro' })
  @ApiResponse({ status: 200, description: 'Logro actualizado exitosamente.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAchievementDto,
  ): Promise<AchievementDocument> {
    return await this.achievementsService.update(id, updateDto);
  }

  /**
   * Endpoint DELETE /achievements/:id
   *
   * Propósito: Eliminar una condecoración por su ID.
   * @param id - Identificador del logro (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar logro',
    description: 'Remueve un logro o insignia de la base de datos.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del logro' })
  @ApiResponse({ status: 200, description: 'Logro eliminado exitosamente.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.achievementsService.remove(id);
  }
}
