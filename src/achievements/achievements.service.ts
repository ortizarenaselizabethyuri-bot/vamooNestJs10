import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { RoutesService } from '../routes/routes.service.js';
import { UsersService } from '../users/users.service.js';
import { CreateAchievementDto } from './dto/create-achievement.dto.js';
import { QueryAchievementDto } from './dto/query-achievement.dto.js';
import { UpdateAchievementDto } from './dto/update-achievement.dto.js';
import { AchievementCategory } from './enums/achievement-category.enum.js';
import { AchievementType } from './enums/achievement-type.enum.js';
import {
  Achievement,
  AchievementDocument,
} from './schemas/achievement.schema.js';

/**
 * Servicio encargado de la lógica de negocio para la gestión y concesión de insignias y trofeos.
 *
 * Propósito: Gestionar el otorgamiento de condecoraciones por rutas completadas, campeonatos de liga,
 * hitos de racha y eventos temporales de edición limitada.
 */
@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  /**
   * Inyecta el modelo de Mongoose para Achievement y los servicios de usuarios y rutas.
   *
   * @param achievementModel - Modelo de Mongoose para la colección 'achievements'.
   * @param usersService - Servicio de usuarios para verificar destinatarios.
   * @param routesService - Servicio de rutas para validar destinos asociados.
   */
  constructor(
    @InjectModel(Achievement.name)
    private readonly achievementModel: Model<AchievementDocument>,
    private readonly usersService: UsersService,
    private readonly routesService: RoutesService,
  ) {}

  /**
   * Otorga y registra una nueva insignia o trofeo a un usuario.
   *
   * Propósito: Validar la existencia del usuario y ruta (si aplica) antes de guardar el galardón.
   * @param createDto - Parámetros de la condecoración.
   * @returns Promise<AchievementDocument> Registro del logro otorgado.
   * @throws ConflictException Si el usuario ya posee exactamente esa misma condecoración.
   */
  async create(createDto: CreateAchievementDto): Promise<AchievementDocument> {
    this.validateObjectId(createDto.usuarioId);
    await this.usersService.findById(createDto.usuarioId);

    if (createDto.rutaId) {
      this.validateObjectId(createDto.rutaId);
      await this.routesService.findById(createDto.rutaId);
    }

    // Verificar si el usuario ya cuenta con una condecoración idéntica por título y categoría
    const existing = await this.achievementModel.findOne({
      usuarioId: createDto.usuarioId,
      titulo: createDto.titulo.trim(),
      categoria: createDto.categoria,
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ya posee la condecoración "${createDto.titulo}".`,
      );
    }

    const newAchievement = new this.achievementModel({
      ...createDto,
      fechaObtencion: createDto.fechaObtencion
        ? new Date(createDto.fechaObtencion)
        : new Date(),
    });

    const saved = await newAchievement.save();
    this.logger.log(`🏅 Logro otorgado a ${createDto.usuarioId}: "${saved.titulo}" (${saved.tipo} - ${saved.categoria})`);
    return saved;
  }

  /**
   * Consulta logros aplicando filtros opcionales de usuario, tipo, categoría o edición limitada.
   *
   * @param query - Filtros de búsqueda.
   * @returns Promise<AchievementDocument[]> Lista de condecoraciones encontradas.
   */
  async findAll(query: QueryAchievementDto): Promise<AchievementDocument[]> {
    const filter: Record<string, any> = {};

    if (query.usuarioId) {
      this.validateObjectId(query.usuarioId);
      filter.usuarioId = query.usuarioId;
    }
    if (query.tipo) {
      filter.tipo = query.tipo;
    }
    if (query.categoria) {
      filter.categoria = query.categoria;
    }
    if (typeof query.esEdicionLimitada === 'boolean') {
      filter.esEdicionLimitada = query.esEdicionLimitada;
    }

    return await this.achievementModel
      .find(filter)
      .populate('usuarioId', 'name email picture currentRank')
      .populate('rutaId', 'nombre tipo ubicacion')
      .sort({ fechaObtencion: -1 })
      .exec();
  }

  /**
   * Obtiene todos los logros (insignias y trofeos) obtenidos por un usuario específico.
   *
   * Propósito: Proveer el medallero completo para el perfil público o vitrina del usuario.
   * @param userId - Identificador del usuario.
   * @returns Promise<AchievementDocument[]> Lista de condecoraciones ganadas.
   */
  async findByUser(userId: string): Promise<AchievementDocument[]> {
    this.validateObjectId(userId);

    return await this.achievementModel
      .find({ usuarioId: userId })
      .populate('rutaId', 'nombre tipo ubicacion')
      .sort({ fechaObtencion: -1 })
      .exec();
  }

  /**
   * Obtiene los detalles de un logro por su ID único de MongoDB.
   *
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<AchievementDocument> Documento del logro.
   */
  async findById(id: string): Promise<AchievementDocument> {
    this.validateObjectId(id);

    const achievement = await this.achievementModel
      .findById(id)
      .populate('usuarioId', 'name email picture currentRank')
      .populate('rutaId', 'nombre tipo ubicacion')
      .exec();

    if (!achievement) {
      throw new NotFoundException(`Logro con ID "${id}" no encontrado.`);
    }

    return achievement;
  }

  /**
   * Otorga de forma automática la insignia correspondiente a la finalización de una ruta.
   *
   * Propósito: Método helper para ser invocado tras una actividad física en un destino.
   * @param userId - ID del usuario.
   * @param routeId - ID de la ruta completada.
   * @returns Promise<AchievementDocument | null> Logro creado o null si ya lo poseía.
   */
  async awardBadgeForRoute(
    userId: string,
    routeId: string,
  ): Promise<AchievementDocument | null> {
    const route = await this.routesService.findById(routeId);

    const existing = await this.achievementModel.findOne({
      usuarioId: userId,
      rutaId: routeId,
    });

    if (existing) {
      return null;
    }

    const categoria = route.esEdicionLimitada
      ? AchievementCategory.EVENTO_ESPECIAL
      : AchievementCategory.RUTA_PERMANENTE;

    const newBadge = new this.achievementModel({
      usuarioId: userId,
      tipo: AchievementType.INSIGNIA,
      titulo: `Explorador: ${route.nombre}`,
      descripcion: `Completaste con éxito la ruta "${route.nombre}".`,
      categoria,
      esEdicionLimitada: route.esEdicionLimitada,
      rutaId: route._id,
      fechaObtencion: new Date(),
    });

    const saved = await newBadge.save();
    this.logger.log(`🎖️ Insignia de ruta otorgada a ${userId}: "${saved.titulo}"`);
    return saved;
  }

  /**
   * Actualiza parcialmente la información de un logro existente.
   *
   * @param id - Identificador de MongoDB (_id).
   * @param updateDto - Campos a modificar.
   * @returns Promise<AchievementDocument> Documento modificado.
   */
  async update(
    id: string,
    updateDto: UpdateAchievementDto,
  ): Promise<AchievementDocument> {
    this.validateObjectId(id);

    const updated = await this.achievementModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Logro con ID "${id}" no encontrado.`);
    }

    return updated;
  }

  /**
   * Elimina un logro de la base de datos por su ID.
   *
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deleted = await this.achievementModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Logro con ID "${id}" no encontrado.`);
    }

    return {
      message: 'Logro eliminado exitosamente.',
      deletedId: id,
    };
  }

  /**
   * Valida que una cadena cumpla el formato de ObjectId de MongoDB.
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
