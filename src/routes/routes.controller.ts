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
import { CreateRouteDto } from './dto/create-route.dto.js';
import { QueryNearbyRoutesDto } from './dto/query-nearby.dto.js';
import { QueryRoutesDto } from './dto/query-routes.dto.js';
import { UpdateRouteDto } from './dto/update-route.dto.js';
import { RoutesService } from './routes.service.js';
import { RouteDocument } from './schemas/route.schema.js';

/**
 * Controlador HTTP para el recurso de rutas y destinos (/routes).
 *
 * Propósito: Exponer endpoints REST para el catálogo de rutas, búsqueda por proximidad GPS ($near),
 * lectura de códigos QR y administración de destinos.
 */
@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  /**
   * Inyecta la instancia del servicio de rutas.
   *
   * @param routesService - Servicio de lógica de negocio de rutas.
   */
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Endpoint POST /routes
   *
   * Propósito: Registrar un nuevo destino o ruta en la plataforma.
   * @param createRouteDto - Datos de la ruta a crear.
   * @returns Promise<RouteDocument> Documento de la ruta creada.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear ruta o destino',
    description: 'Registra un nuevo punto de interés con coordenadas GeoJSON Point e información de XP.',
  })
  @ApiResponse({ status: 201, description: 'Ruta creada exitosamente.' })
  @ApiResponse({ status: 409, description: 'El código QR ya está registrado en otra ruta.' })
  async create(@Body() createRouteDto: CreateRouteDto): Promise<RouteDocument> {
    return await this.routesService.create(createRouteDto);
  }

  /**
   * Endpoint GET /routes
   *
   * Propósito: Obtener listado de rutas aplicando filtros opcionales de tipo, aliados, limitadas y búsqueda.
   * @param query - Parámetros de filtrado.
   * @returns Promise<RouteDocument[]> Lista de rutas encontradas.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar rutas',
    description: 'Obtiene el catálogo de rutas con filtros por tipo, local aliado, edición limitada o nombre.',
  })
  @ApiResponse({ status: 200, description: 'Lista de rutas obtenida correctamente.' })
  async findAll(@Query() query: QueryRoutesDto): Promise<RouteDocument[]> {
    return await this.routesService.findAll(query);
  }

  /**
   * Endpoint GET /routes/nearby
   *
   * Propósito: Buscar rutas cercanas a la posición geográfica actual del usuario.
   * @param queryNearby - Longitud, latitud y radio máximo en km.
   * @returns Promise<RouteDocument[]> Rutas dentro del radio especificado ordenadas por proximidad.
   */
  @Get('nearby')
  @ApiOperation({
    summary: 'Buscar rutas cercanas por GPS',
    description: 'Utiliza el índice geoespacial 2dsphere ($near) para retornar rutas ordenadas por proximidad.',
  })
  @ApiResponse({ status: 200, description: 'Rutas cercanas encontradas.' })
  async findNearby(
    @Query() queryNearby: QueryNearbyRoutesDto,
  ): Promise<RouteDocument[]> {
    return await this.routesService.findNearby(queryNearby);
  }

  /**
   * Endpoint GET /routes/qr/:code
   *
   * Propósito: Obtener la ruta o local aliado correspondiente a un código QR escaneado.
   * @param code - Código QR capturado.
   * @returns Promise<RouteDocument> Documento de la ruta aliada.
   */
  @Get('qr/:code')
  @ApiOperation({
    summary: 'Buscar ruta por código QR',
    description: 'Permite identificar el local aliado al escanear su código QR.',
  })
  @ApiParam({ name: 'code', description: 'Código QR alfanumérico único' })
  @ApiResponse({ status: 200, description: 'Ruta aliada encontrada.' })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado.' })
  async findByQrCode(@Param('code') code: string): Promise<RouteDocument> {
    return await this.routesService.findByQrCode(code);
  }

  /**
   * Endpoint GET /routes/:id
   *
   * Propósito: Consultar los detalles de una ruta específica por su identificador único.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<RouteDocument> Documento de la ruta.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener ruta por ID',
    description: 'Consulta los datos y coordenadas completas de una ruta.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la ruta' })
  @ApiResponse({ status: 200, description: 'Ruta encontrada.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async findOne(@Param('id') id: string): Promise<RouteDocument> {
    return await this.routesService.findById(id);
  }

  /**
   * Endpoint PATCH /routes/:id
   *
   * Propósito: Actualizar uno o varios campos de una ruta existente.
   * @param id - Identificador de la ruta (_id).
   * @param updateRouteDto - Datos a modificar.
   * @returns Promise<RouteDocument> Documento de la ruta actualizado.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar ruta',
    description: 'Modifica parcialmente campos de la ruta verificando no duplicar códigos QR.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la ruta' })
  @ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<RouteDocument> {
    return await this.routesService.update(id, updateRouteDto);
  }

  /**
   * Endpoint DELETE /routes/:id
   *
   * Propósito: Eliminar una ruta de la base de datos por su ID.
   * @param id - Identificador de la ruta (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar ruta',
    description: 'Remueve permanentemente un destino del catálogo.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB de la ruta' })
  @ApiResponse({ status: 200, description: 'Ruta eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.routesService.remove(id);
  }
}
