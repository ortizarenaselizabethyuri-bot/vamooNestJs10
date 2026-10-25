import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { RoutesService } from '../routes/routes.service.js';
import { UsersService } from '../users/users.service.js';
import { CreateUserActivityDto } from './dto/create-user-activity.dto.js';
import { QueryUserActivityDto } from './dto/query-user-activity.dto.js';
import { UpdateUserActivityDto } from './dto/update-user-activity.dto.js';
import {
  UserActivity,
  UserActivityDocument,
} from './schemas/user-activity.schema.js';

/**
 * Servicio encargado de la lógica de negocio para el registro y validación de actividades físicas.
 *
 * Propósito: Gestionar el registro de salidas, cálculo de XP con bonificaciones (lugar nuevo, acompañamiento)
 * y acreditación atómica de experiencia al usuario.
 */
@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  /**
   * Inyecta el modelo de Mongoose para UserActivity y los servicios de usuarios y rutas.
   *
   * @param userActivityModel - Modelo de Mongoose para la colección 'user_activities'.
   * @param usersService - Servicio para consultar y acreditar XP al usuario.
   * @param routesService - Servicio para consultar información y validaciones de rutas.
   */
  constructor(
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivityDocument>,
    private readonly usersService: UsersService,
    private readonly routesService: RoutesService,
  ) {}

  /**
   * Registra una nueva salida o actividad de un usuario y calcula sus puntos de experiencia.
   *
   * Reglas de gamificación aplicadas:
   * 1. Si incluye ruta: Otorga el XP base de la ruta (100 o 150).
   * 2. Regla de primer lugar: Si es la primera visita a la ruta otorga +50 XP; si es repetida +5 XP.
   * 3. Si es caminata libre (sin ruta): Otorga 15 XP por cada kilómetro recorrido.
   * 4. Bonus de compañía: Si fue acompañado, aplica un +20% sobre el subtotal acumulado.
   * 5. Acreditación automática: Se llama a usersService.addXp() para actualizar totalXp y leagueXp.
   *
   * @param createDto - Parámetros de la actividad a registrar.
   * @returns Promise<UserActivityDocument> Registro de actividad creado.
   */
  async create(createDto: CreateUserActivityDto): Promise<UserActivityDocument> {
    this.validateObjectId(createDto.usuarioId);
    // Verificar que el usuario exista
    await this.usersService.findById(createDto.usuarioId);

    let xpBase = 0;
    let esLugarNuevo = false;

    if (createDto.rutaId) {
      this.validateObjectId(createDto.rutaId);
      const ruta = await this.routesService.findById(createDto.rutaId);

      // Comprobar si es la primera vez que el usuario realiza esta ruta
      const actividadPrevia = await this.userActivityModel.findOne({
        usuarioId: createDto.usuarioId,
        rutaId: createDto.rutaId,
      });

      if (!actividadPrevia) {
        esLugarNuevo = true;
        xpBase = ruta.xpOtorgada + 50; // Bonus de 50 XP por primera visita
      } else {
        esLugarNuevo = false;
        xpBase = ruta.xpOtorgada + 5; // Bonus de 5 XP por revisita
      }
    } else {
      // Caminata libre: 15 XP por kilómetro recorrido (mínimo 10 XP)
      xpBase = Math.max(10, Math.round(createDto.distanciaKm * 15));
      esLugarNuevo = false;
    }

    // Aplicar bonus del 20% si fue acompañado por otro usuario
    let xpFinal = xpBase;
    if (createDto.acompanado) {
      xpFinal = Math.round(xpBase * 1.2);
    }

    const nuevaActividad = new this.userActivityModel({
      ...createDto,
      esLugarNuevo,
      xpGanada: xpFinal,
      fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
    });

    const actividadGuardada = await nuevaActividad.save();

    // Acreditar los puntos de experiencia al usuario de forma atómica
    await this.usersService.addXp(createDto.usuarioId, xpFinal);

    this.logger.log(
      `🏃 Actividad registrada para usuario ${createDto.usuarioId}: ${createDto.distanciaKm}km, ` +
        `esLugarNuevo: ${esLugarNuevo}, acompanado: ${!!createDto.acompanado} -> +${xpFinal} XP otorgados.`,
    );

    return actividadGuardada;
  }

  /**
   * Obtiene la lista de actividades registradas aplicando filtros de búsqueda.
   *
   * Propósito: Consultar el historial filtrado por usuario, ruta o rango temporal.
   * @param query - Filtros opcionales (usuarioId, rutaId, fechas).
   * @returns Promise<UserActivityDocument[]> Arreglo de actividades ordenadas cronológicamente.
   */
  async findAll(query: QueryUserActivityDto): Promise<UserActivityDocument[]> {
    const filter: Record<string, any> = {};

    if (query.usuarioId) {
      this.validateObjectId(query.usuarioId);
      filter.usuarioId = query.usuarioId;
    }
    if (query.rutaId) {
      this.validateObjectId(query.rutaId);
      filter.rutaId = query.rutaId;
    }
    if (query.fechaInicio || query.fechaFin) {
      filter.fecha = {};
      if (query.fechaInicio) {
        filter.fecha.$gte = new Date(query.fechaInicio);
      }
      if (query.fechaFin) {
        filter.fecha.$lte = new Date(query.fechaFin);
      }
    }

    return await this.userActivityModel
      .find(filter)
      .populate('usuarioId', 'name email picture currentRank')
      .populate('rutaId', 'nombre tipo xpOtorgada ubicacion')
      .sort({ fecha: -1 })
      .exec();
  }

  /**
   * Obtiene un registro de actividad específico por su ID.
   *
   * Propósito: Consultar el detalle de una salida con referencias de usuario y ruta populadas.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<UserActivityDocument> Documento de la actividad.
   * @throws NotFoundException Si no se encuentra la actividad.
   */
  async findById(id: string): Promise<UserActivityDocument> {
    this.validateObjectId(id);

    const actividad = await this.userActivityModel
      .findById(id)
      .populate('usuarioId', 'name email picture currentRank')
      .populate('rutaId', 'nombre tipo xpOtorgada ubicacion')
      .exec();

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID "${id}" no encontrada.`);
    }

    return actividad;
  }

  /**
   * Obtiene estadísticas agregadas de actividad para un usuario (total km, total salidas y total XP).
   *
   * Propósito: Proveer métricas resumen para la pantalla de perfil o panel de logros.
   * @param usuarioId - Identificador del usuario.
   * @returns Promise<object> Resumen de distancia, actividades y XP acumulado en salidas.
   */
  async getUserStats(usuarioId: string): Promise<{
    usuarioId: string;
    totalSalidas: number;
    totalDistanciaKm: number;
    totalXpEnSalidas: number;
  }> {
    this.validateObjectId(usuarioId);

    const actividades = await this.userActivityModel.find({ usuarioId }).exec();

    const totalSalidas = actividades.length;
    const totalDistanciaKm = actividades.reduce(
      (acc, curr) => acc + (curr.distanciaKm || 0),
      0,
    );
    const totalXpEnSalidas = actividades.reduce(
      (acc, curr) => acc + (curr.xpGanada || 0),
      0,
    );

    return {
      usuarioId,
      totalSalidas,
      totalDistanciaKm: Math.round(totalDistanciaKm * 100) / 100,
      totalXpEnSalidas,
    };
  }

  /**
   * Actualiza parcialmente un registro de actividad.
   *
   * Propósito: Corregir datos de una salida existente sin re-acreditar XP.
   * @param id - Identificador de MongoDB (_id).
   * @param updateDto - Campos a modificar.
   * @returns Promise<UserActivityDocument> Registro actualizado.
   */
  async update(
    id: string,
    updateDto: UpdateUserActivityDto,
  ): Promise<UserActivityDocument> {
    this.validateObjectId(id);

    const updated = await this.userActivityModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('usuarioId', 'name email picture currentRank')
      .populate('rutaId', 'nombre tipo xpOtorgada ubicacion')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Actividad con ID "${id}" no encontrada.`);
    }

    return updated;
  }

  /**
   * Elimina un registro de actividad por su ID.
   *
   * Propósito: Remover actividades erróneas o canceladas.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deleted = await this.userActivityModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Actividad con ID "${id}" no encontrada.`);
    }

    return {
      message: 'Registro de actividad eliminado exitosamente.',
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
