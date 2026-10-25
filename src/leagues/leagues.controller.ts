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
import { AddMemberDto } from './dto/add-member.dto.js';
import { AutoAssignDto } from './dto/auto-assign.dto.js';
import { CreateLeagueGroupDto } from './dto/create-league-group.dto.js';
import { QueryLeagueGroupDto } from './dto/query-league-group.dto.js';
import { UpdateLeagueGroupDto } from './dto/update-league-group.dto.js';
import { LeaguesService } from './leagues.service.js';
import { LeagueGroupDocument } from './schemas/league-group.schema.js';

/**
 * Controlador HTTP para el recurso de ligas semanales (/leagues).
 *
 * Propósito: Exponer los endpoints REST para gestión de grupos de liga,
 * asignaciones de competidores y obtención de la tabla de posiciones (leaderboard).
 */
@ApiTags('leagues')
@Controller('leagues')
export class LeaguesController {
  /**
   * Inyecta la instancia del servicio de ligas.
   *
   * @param leaguesService - Servicio de lógica de negocio para ligas.
   */
  constructor(private readonly leaguesService: LeaguesService) {}

  /**
   * Endpoint POST /leagues
   *
   * Propósito: Crear manualmente un nuevo grupo de liga semanal.
   * @param createDto - Datos de inicialización del grupo.
   * @returns Promise<LeagueGroupDocument> Documento del grupo creado.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear grupo de liga',
    description: 'Inicializa un contenedor de liga semanal para un rango y ciclo determinado.',
  })
  @ApiResponse({ status: 201, description: 'Grupo de liga creado exitosamente.' })
  async create(
    @Body() createDto: CreateLeagueGroupDto,
  ): Promise<LeagueGroupDocument> {
    return await this.leaguesService.create(createDto);
  }

  /**
   * Endpoint GET /leagues
   *
   * Propósito: Consultar grupos de liga con filtros opcionales de rango, ciclo y estado.
   * @param query - Filtros de búsqueda (rango, cicloSemanal, activo).
   * @returns Promise<LeagueGroupDocument[]> Lista de grupos encontrados.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar grupos de liga',
    description: 'Obtiene los grupos de liga según filtros de rango, ciclo o estado activo.',
  })
  @ApiResponse({ status: 200, description: 'Lista de grupos obtenida correctamente.' })
  async findAll(
    @Query() query: QueryLeagueGroupDto,
  ): Promise<LeagueGroupDocument[]> {
    return await this.leaguesService.findAll(query);
  }

  /**
   * Endpoint POST /leagues/auto-assign
   *
   * Propósito: Emparejar automáticamente a un usuario en un grupo activo con cupo (<30)
   * o crear un nuevo grupo si los existentes están completos.
   * @param autoAssignDto - Parámetros con usuarioId, rango y cicloSemanal.
   * @returns Promise<LeagueGroupDocument> Grupo al que fue asignado.
   */
  @Post('auto-assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emparejamiento automático en liga',
    description: 'Asigna al usuario a un grupo con cupo (<30 miembros) o crea uno nuevo automáticamente.',
  })
  @ApiResponse({ status: 200, description: 'Usuario emparejado en el grupo exitosamente.' })
  async autoAssign(
    @Body() autoAssignDto: AutoAssignDto,
  ): Promise<LeagueGroupDocument> {
    return await this.leaguesService.assignUserToAvailableGroup(
      autoAssignDto.usuarioId,
      autoAssignDto.rango,
      autoAssignDto.cicloSemanal,
    );
  }

  /**
   * Endpoint GET /leagues/user/:userId/cycle/:cycle
   *
   * Propósito: Obtener el grupo de liga activo al que pertenece un usuario en un ciclo dado.
   * @param userId - ID del usuario.
   * @param cycle - Identificador del ciclo semanal (ej. "2026-W43").
   * @returns Promise<LeagueGroupDocument | null> Grupo asignado o null.
   */
  @Get('user/:userId/cycle/:cycle')
  @ApiOperation({
    summary: 'Obtener liga activa del usuario',
    description: 'Busca el grupo de liga activo al que está asignado el usuario en una semana dada.',
  })
  @ApiParam({ name: 'userId', description: 'ObjectId del usuario' })
  @ApiParam({ name: 'cycle', description: 'Identificador del ciclo semanal (ej. 2026-W43)' })
  @ApiResponse({ status: 200, description: 'Grupo de liga del usuario obtenido.' })
  async findUserActiveGroup(
    @Param('userId') userId: string,
    @Param('cycle') cycle: string,
  ): Promise<LeagueGroupDocument | null> {
    return await this.leaguesService.findUserActiveGroup(userId, cycle);
  }

  /**
   * Endpoint GET /leagues/:id/leaderboard
   *
   * Propósito: Retornar la clasificación en vivo de un grupo de liga ordenada por leagueXp,
   * identificando puestos de ascenso, permanencia y descenso.
   * @param id - Identificador único del grupo de liga.
   * @returns Promise<object> Tabla de posiciones detallada.
   */
  @Get(':id/leaderboard')
  @ApiOperation({
    summary: 'Obtener tabla de posiciones (leaderboard)',
    description: 'Devuelve los miembros clasificados por leagueXp, con zonas de ascenso, permanencia y descenso.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del grupo de liga' })
  @ApiResponse({ status: 200, description: 'Clasificación generada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Grupo de liga no encontrado.' })
  async getLeaderboard(@Param('id') id: string) {
    return await this.leaguesService.getLeaderboard(id);
  }

  /**
   * Endpoint GET /leagues/:id
   *
   * Propósito: Obtener los detalles de un grupo de liga por su ID.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<LeagueGroupDocument> Documento del grupo con miembros populados.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener grupo de liga por ID',
    description: 'Consulta los datos de un grupo con sus miembros populados.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del grupo de liga' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado.' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado.' })
  async findOne(@Param('id') id: string): Promise<LeagueGroupDocument> {
    return await this.leaguesService.findById(id);
  }

  /**
   * Endpoint POST /leagues/:id/members
   *
   * Propósito: Agregar un usuario a un grupo de liga específico.
   * @param id - Identificador del grupo de liga.
   * @param addMemberDto - DTO con el usuarioId a incorporar.
   * @returns Promise<LeagueGroupDocument> Grupo actualizado con el nuevo miembro.
   */
  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Añadir miembro al grupo de liga',
    description: 'Agrega un usuario al grupo validando cupo máximo y duplicidad.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId del grupo de liga' })
  @ApiResponse({ status: 200, description: 'Miembro añadido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Límite de miembros superado.' })
  @ApiResponse({ status: 409, description: 'El usuario ya pertenece al grupo.' })
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<LeagueGroupDocument> {
    return await this.leaguesService.addMember(id, addMemberDto);
  }

  /**
   * Endpoint DELETE /leagues/:id/members/:userId
   *
   * Propósito: Remover a un usuario de un grupo de liga.
   * @param id - Identificador del grupo de liga.
   * @param userId - Identificador del usuario a retirar.
   * @returns Promise<LeagueGroupDocument> Grupo actualizado.
   */
  @Delete(':id/members/:userId')
  @ApiOperation({
    summary: 'Remover miembro del grupo de liga',
    description: 'Retira a un usuario del grupo y limpia su referencia actual.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId del grupo de liga' })
  @ApiParam({ name: 'userId', description: 'ObjectId del usuario a remover' })
  @ApiResponse({ status: 200, description: 'Miembro retirado exitosamente.' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<LeagueGroupDocument> {
    return await this.leaguesService.removeMember(id, userId);
  }

  /**
   * Endpoint PATCH /leagues/:id
   *
   * Propósito: Actualizar parcialmente las propiedades de un grupo de liga.
   * @param id - Identificador del grupo de liga.
   * @param updateDto - Campos a modificar.
   * @returns Promise<LeagueGroupDocument> Grupo modificado.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar grupo de liga',
    description: 'Modifica parámetros del grupo como estado o límite de miembros.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId del grupo de liga' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLeagueGroupDto,
  ): Promise<LeagueGroupDocument> {
    return await this.leaguesService.update(id, updateDto);
  }

  /**
   * Endpoint DELETE /leagues/:id
   *
   * Propósito: Eliminar un grupo de liga de la base de datos.
   * @param id - Identificador del grupo.
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar grupo de liga',
    description: 'Borra un grupo de liga de la colección.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId del grupo de liga' })
  @ApiResponse({ status: 200, description: 'Grupo de liga eliminado.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.leaguesService.remove(id);
  }
}
