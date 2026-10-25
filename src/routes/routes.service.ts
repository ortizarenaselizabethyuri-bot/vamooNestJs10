import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateRouteDto } from './dto/create-route.dto.js';
import { QueryNearbyRoutesDto } from './dto/query-nearby.dto.js';
import { QueryRoutesDto } from './dto/query-routes.dto.js';
import { UpdateRouteDto } from './dto/update-route.dto.js';
import { RouteType } from './enums/route-type.enum.js';
import { Route, RouteDocument } from './schemas/route.schema.js';

/**
 * Servicio encargado de la lógica de negocio para la gestión de rutas y destinos.
 *
 * Propósito: Gestionar el catálogo de rutas, consultas geoespaciales por GPS ($near),
 * validación de códigos QR de locales aliados y configuración de recompensas.
 */
@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  /**
   * Inyecta el modelo de Mongoose para la entidad Route.
   *
   * @param routeModel - Modelo de Mongoose para la colección 'routes'.
   */
  constructor(
    @InjectModel(Route.name)
    private readonly routeModel: Model<RouteDocument>,
  ) {}

  /**
   * Registra una nueva ruta o punto de interés en la base de datos.
   *
   * Propósito: Crear la ruta validando que el código QR (si existe) no esté duplicado
   * y asignando el valor de XP por defecto según el tipo si no se especifica.
   * @param createRouteDto - Datos de la ruta a crear.
   * @returns Promise<RouteDocument> Documento de la ruta creada.
   * @throws ConflictException Si el código QR ya está registrado en otra ruta.
   */
  async create(createRouteDto: CreateRouteDto): Promise<RouteDocument> {
    if (createRouteDto.codigoQR) {
      const existingQr = await this.routeModel.findOne({
        codigoQR: createRouteDto.codigoQR.trim(),
      });
      if (existingQr) {
        throw new ConflictException(
          `El código QR "${createRouteDto.codigoQR}" ya está en uso por la ruta "${existingQr.nombre}".`,
        );
      }
    }

    // Asignación de XP por defecto según el tipo si no se especificó
    const defaultXp =
      createRouteDto.tipo === RouteType.EVENTO_ESPECIAL ? 150 : 100;
    const xpOtorgada =
      typeof createRouteDto.xpOtorgada === 'number'
        ? createRouteDto.xpOtorgada
        : defaultXp;

    const newRoute = new this.routeModel({
      ...createRouteDto,
      xpOtorgada,
    });

    const saved = await newRoute.save();
    this.logger.log(`🗺️ Ruta creada: "${saved.nombre}" (${saved.tipo}, +${saved.xpOtorgada} XP) - ID: ${saved._id}`);
    return saved;
  }

  /**
   * Consulta rutas aplicando filtros opcionales de tipo, aliados, limitadas y búsqueda por nombre.
   *
   * Propósito: Proveer listados filtrados para la aplicación y panel de administración.
   * @param query - Parámetros de filtrado.
   * @returns Promise<RouteDocument[]> Arreglo de rutas encontradas.
   */
  async findAll(query: QueryRoutesDto): Promise<RouteDocument[]> {
    const filter: Record<string, any> = {};

    if (query.tipo) {
      filter.tipo = query.tipo;
    }
    if (typeof query.esLocalAliado === 'boolean') {
      filter.esLocalAliado = query.esLocalAliado;
    }
    if (typeof query.esEdicionLimitada === 'boolean') {
      filter.esEdicionLimitada = query.esEdicionLimitada;
    }
    if (typeof query.activo === 'boolean') {
      filter.activo = query.activo;
    }
    if (query.search) {
      filter.nombre = { $regex: query.search.trim(), $options: 'i' };
    }

    return await this.routeModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Busca rutas cercanas a la posición geográfica del usuario utilizando el índice 2dsphere.
   *
   * Propósito: Permitir a los usuarios descubrir rutas y puntos de interés a su alrededor mediante GPS.
   * @param queryNearby - Coordenadas (longitud, latitud) y radio máximo en km.
   * @returns Promise<RouteDocument[]> Lista de rutas cercanas ordenadas por distancia ascendente.
   */
  async findNearby(queryNearby: QueryNearbyRoutesDto): Promise<RouteDocument[]> {
    const maxDistanceMeters = (queryNearby.maxDistanceKm || 10) * 1000;

    const nearbyRoutes = await this.routeModel
      .find({
        activo: true,
        ubicacion: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [queryNearby.longitude, queryNearby.latitude],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .exec();

    this.logger.log(
      `📍 Búsqueda cercana [${queryNearby.longitude}, ${queryNearby.latitude}] radio: ${queryNearby.maxDistanceKm || 10}km - Encontradas: ${nearbyRoutes.length}`,
    );
    return nearbyRoutes;
  }

  /**
   * Obtiene los detalles de una ruta por su ID único.
   *
   * Propósito: Recuperar la información completa de una ruta.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<RouteDocument> Documento de la ruta.
   * @throws NotFoundException Si la ruta no existe.
   */
  async findById(id: string): Promise<RouteDocument> {
    this.validateObjectId(id);

    const route = await this.routeModel.findById(id).exec();
    if (!route) {
      throw new NotFoundException(`Ruta con ID "${id}" no encontrada.`);
    }

    return route;
  }

  /**
   * Busca una ruta o local aliado a través de su código QR.
   *
   * Propósito: Permitir la validación de visitas físicas en locales aliados al escanear su código QR.
   * @param qrCode - Código escaneado.
   * @returns Promise<RouteDocument> Documento de la ruta asociada.
   * @throws NotFoundException Si no existe ninguna ruta con ese código QR.
   */
  async findByQrCode(qrCode: string): Promise<RouteDocument> {
    const route = await this.routeModel
      .findOne({
        codigoQR: qrCode.trim(),
        activo: true,
      })
      .exec();

    if (!route) {
      this.logger.warn(`Intento de lectura con código QR no reconocido: "${qrCode}"`);
      throw new NotFoundException(
        `No se encontró ninguna ruta o local aliado con el código QR "${qrCode}".`,
      );
    }

    this.logger.log(`📱 Código QR validado con éxito: "${route.nombre}" (ID: ${route._id})`);
    return route;
  }

  /**
   * Actualiza parcialmente la información de una ruta existente.
   *
   * Propósito: Modificar datos de una ruta validando no colisionar con códigos QR existentes.
   * @param id - Identificador de MongoDB (_id).
   * @param updateRouteDto - Datos a actualizar.
   * @returns Promise<RouteDocument> Documento de la ruta modificado.
   */
  async update(
    id: string,
    updateRouteDto: UpdateRouteDto,
  ): Promise<RouteDocument> {
    this.validateObjectId(id);

    if (updateRouteDto.codigoQR) {
      const existingQr = await this.routeModel.findOne({
        codigoQR: updateRouteDto.codigoQR.trim(),
        _id: { $ne: id },
      });
      if (existingQr) {
        throw new ConflictException(
          `El código QR "${updateRouteDto.codigoQR}" ya está en uso por otra ruta.`,
        );
      }
    }

    const updatedRoute = await this.routeModel
      .findByIdAndUpdate(id, updateRouteDto, { new: true })
      .exec();

    if (!updatedRoute) {
      throw new NotFoundException(`Ruta con ID "${id}" no encontrada.`);
    }

    return updatedRoute;
  }

  /**
   * Elimina una ruta de la base de datos por su ID.
   *
   * Propósito: Remover la ruta del catálogo.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deleted = await this.routeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Ruta con ID "${id}" no encontrada.`);
    }

    return {
      message: 'Ruta eliminada exitosamente.',
      deletedId: id,
    };
  }

  /**
   * Valida que una cadena cumpla con el formato de ObjectId de MongoDB.
   *
   * @param id - Cadena a evaluar.
   * @throws BadRequestException Si el formato es inválido.
   */
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        `El identificador "${id}" no tiene un formato válido de ObjectId de MongoDB.`,
      );
    }
  }
}
