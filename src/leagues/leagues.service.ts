import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { UserRank } from '../users/enums/user-rank.enum.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateLeagueGroupDto } from './dto/create-league-group.dto.js';
import { QueryLeagueGroupDto } from './dto/query-league-group.dto.js';
import { UpdateLeagueGroupDto } from './dto/update-league-group.dto.js';
import {
  LeagueGroup,
  LeagueGroupDocument,
} from './schemas/league-group.schema.js';

/**
 * Servicio encargado de la lógica de negocio para grupos de liga semanal.
 *
 * Propósito: Gestionar la creación, asignación dinámica de participantes (~30 usuarios),
 * cálculo del ranking de posiciones y el ciclo de competencia semanal.
 */
@Injectable()
export class LeaguesService {
  private readonly logger = new Logger(LeaguesService.name);

  /**
   * Inyecta los modelos de Mongoose para LeagueGroup y User.
   *
   * @param leagueGroupModel - Modelo de Mongoose para la colección 'league_groups'.
   * @param userModel - Modelo de Mongoose para la colección 'users'.
   */
  constructor(
    @InjectModel(LeagueGroup.name)
    private readonly leagueGroupModel: Model<LeagueGroupDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Crea un nuevo grupo de liga semanal.
   *
   * Propósito: Registrar un contenedor de liga para un rango y ciclo específico.
   * @param createDto - Datos para la inicialización del grupo.
   * @returns Promise<LeagueGroupDocument> Documento del grupo de liga creado.
   */
  async create(createDto: CreateLeagueGroupDto): Promise<LeagueGroupDocument> {
    const newGroup = new this.leagueGroupModel(createDto);
    const saved = await newGroup.save();
    this.logger.log(`🛡️ Grupo de liga creado: Rango ${saved.rango} - Ciclo ${saved.cicloSemanal} (ID: ${saved._id})`);
    return saved;
  }

  /**
   * Lista todos los grupos de liga según filtros de rango, ciclo y estado.
   *
   * Propósito: Consultar grupos con filtrado dinámico para administración o auditoría.
   * @param query - Filtros opcionales (rango, cicloSemanal, activo).
   * @returns Promise<LeagueGroupDocument[]> Lista de grupos que coinciden con los criterios.
   */
  async findAll(query: QueryLeagueGroupDto): Promise<LeagueGroupDocument[]> {
    const filter: Record<string, any> = {};

    if (query.rango) {
      filter.rango = query.rango;
    }
    if (query.cicloSemanal) {
      filter.cicloSemanal = query.cicloSemanal;
    }
    if (typeof query.activo === 'boolean') {
      filter.activo = query.activo;
    }

    return await this.leagueGroupModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Obtiene un grupo de liga por su ID único.
   *
   * Propósito: Recuperar la información detallada de un grupo con sus miembros populados.
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<LeagueGroupDocument> Documento del grupo de liga.
   * @throws BadRequestException Si el ID no es válido.
   * @throws NotFoundException Si el grupo no existe.
   */
  async findById(id: string): Promise<LeagueGroupDocument> {
    this.validateObjectId(id);

    const group = await this.leagueGroupModel
      .findById(id)
      .populate('miembros', 'name email picture currentRank totalXp leagueXp isPaused')
      .exec();

    if (!group) {
      throw new NotFoundException(`Grupo de liga con ID "${id}" no encontrado.`);
    }

    return group;
  }

  /**
   * Busca el grupo de liga activo al que pertenece un usuario en un ciclo específico.
   *
   * Propósito: Permitir a la aplicación móvil o web mostrar directamente la liga actual del usuario.
   * @param userId - ID del usuario.
   * @param cicloSemanal - Identificador de la semana (ej. "2026-W43").
   * @returns Promise<LeagueGroupDocument | null> Grupo al que pertenece o null.
   */
  async findUserActiveGroup(
    userId: string,
    cicloSemanal: string,
  ): Promise<LeagueGroupDocument | null> {
    this.validateObjectId(userId);

    return await this.leagueGroupModel
      .findOne({
        miembros: userId,
        cicloSemanal,
        activo: true,
      })
      .populate('miembros', 'name email picture currentRank totalXp leagueXp isPaused')
      .exec();
  }

  /**
   * Genera la tabla de posiciones (leaderboard) ordenada por leagueXp para un grupo de liga.
   *
   * Propósito: Entregar la clasificación en tiempo real, delimitando zonas de ascenso y descenso.
   * @param id - Identificador del grupo de liga.
   * @returns Promise<object> Información de la liga y miembros ordenados con su posición y zona.
   * @throws NotFoundException Si el grupo no existe.
   */
  async getLeaderboard(id: string): Promise<{
    grupoId: string;
    rango: string;
    cicloSemanal: string;
    totalMiembros: number;
    posiciones: Array<{
      posicion: number;
      usuario: any;
      zona: 'ascenso' | 'permanencia' | 'descenso';
    }>;
  }> {
    const group = await this.findById(id);

    // Ordenar los miembros populados de mayor a menor leagueXp
    const miembrosOrdenados = (group.miembros as unknown as UserDocument[]).sort(
      (a, b) => (b.leagueXp || 0) - (a.leagueXp || 0),
    );

    const total = miembrosOrdenados.length;

    const posiciones = miembrosOrdenados.map((usuario, index) => {
      const posicion = index + 1;
      let zona: 'ascenso' | 'permanencia' | 'descenso' = 'permanencia';

      if (posicion <= 5) {
        zona = 'ascenso';
      } else if (posicion > Math.max(5, total - 5)) {
        zona = 'descenso';
      }

      return {
        posicion,
        usuario,
        zona,
      };
    });

    return {
      grupoId: group._id.toString(),
      rango: group.rango,
      cicloSemanal: group.cicloSemanal,
      totalMiembros: total,
      posiciones,
    };
  }

  /**
   * Asigna dinámicamente un usuario a un grupo disponible con espacio (<30 miembros) o crea uno nuevo.
   *
   * Propósito: Automatizar el emparejamiento semanal de usuarios sin intervención manual.
   * @param userId - ID del usuario a emparejar.
   * @param rango - Rango actual del usuario.
   * @param cicloSemanal - Ciclo semanal actual.
   * @returns Promise<LeagueGroupDocument> El grupo asignado.
   */
  async assignUserToAvailableGroup(
    userId: string,
    rango: UserRank,
    cicloSemanal: string,
  ): Promise<LeagueGroupDocument> {
    this.validateObjectId(userId);

    // Verificar si el usuario ya está asignado a un grupo en este ciclo
    const existingGroup = await this.leagueGroupModel.findOne({
      miembros: userId,
      cicloSemanal,
      activo: true,
    });

    if (existingGroup) {
      return existingGroup;
    }

    // Buscar un grupo activo con espacio menor al límite (default 30)
    let targetGroup = await this.leagueGroupModel.findOne({
      rango,
      cicloSemanal,
      activo: true,
      $expr: { $lt: [{ $size: '$miembros' }, '$limiteMiembros'] },
    });

    if (!targetGroup) {
      // Si no existe ninguno con espacio, crear un nuevo grupo para este rango y ciclo
      targetGroup = new this.leagueGroupModel({
        rango,
        cicloSemanal,
        miembros: [userId],
        limiteMiembros: 30,
        activo: true,
      });
      await targetGroup.save();
    } else {
      targetGroup.miembros.push(userId as any);
      await targetGroup.save();
    }

    // Actualizar el currentLeagueGroupId del usuario
    await this.userModel.findByIdAndUpdate(userId, {
      currentLeagueGroupId: targetGroup._id,
      isPaused: false,
    });

    this.logger.log(
      `👥 Usuario ${userId} emparejado en grupo de liga ${targetGroup._id} (${rango} - ${cicloSemanal}). Total miembros: ${targetGroup.miembros.length}`,
    );

    return targetGroup;
  }

  /**
   * Incorpora manualmente un usuario a un grupo de liga.
   *
   * Propósito: Añadir un miembro validando que no esté duplicado ni supere el tope del grupo.
   * @param groupId - ID del grupo de liga.
   * @param addMemberDto - DTO con el usuarioId a incorporar.
   * @returns Promise<LeagueGroupDocument> Grupo con el miembro añadido.
   * @throws ConflictException Si el usuario ya está en el grupo.
   * @throws BadRequestException Si el grupo alcanzó su cupo máximo.
   */
  async addMember(
    groupId: string,
    addMemberDto: AddMemberDto,
  ): Promise<LeagueGroupDocument> {
    this.validateObjectId(groupId);
    this.validateObjectId(addMemberDto.usuarioId);

    const group = await this.leagueGroupModel.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Grupo de liga con ID "${groupId}" no encontrado.`);
    }

    const yaEsMiembro = group.miembros.some(
      (m) => m.toString() === addMemberDto.usuarioId,
    );
    if (yaEsMiembro) {
      throw new ConflictException('El usuario ya es integrante de este grupo de liga.');
    }

    if (group.miembros.length >= group.limiteMiembros) {
      throw new BadRequestException(
        `El grupo ha alcanzado su capacidad máxima permitida de ${group.limiteMiembros} integrantes.`,
      );
    }

    group.miembros.push(addMemberDto.usuarioId as any);
    await group.save();

    await this.userModel.findByIdAndUpdate(addMemberDto.usuarioId, {
      currentLeagueGroupId: group._id,
      isPaused: false,
    });

    this.logger.log(`➕ Miembro ${addMemberDto.usuarioId} agregado al grupo de liga ${groupId}`);
    return group;
  }

  /**
   * Retira un usuario de un grupo de liga.
   *
   * Propósito: Remover la vinculación del usuario con el grupo y limpiar su referencia actual.
   * @param groupId - ID del grupo de liga.
   * @param userId - ID del usuario a retirar.
   * @returns Promise<LeagueGroupDocument> Grupo con el miembro retirado.
   */
  async removeMember(
    groupId: string,
    userId: string,
  ): Promise<LeagueGroupDocument> {
    this.validateObjectId(groupId);
    this.validateObjectId(userId);

    const group = await this.leagueGroupModel.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Grupo de liga con ID "${groupId}" no encontrado.`);
    }

    group.miembros = group.miembros.filter(
      (m) => m.toString() !== userId,
    ) as any;
    await group.save();

    await this.userModel.findByIdAndUpdate(userId, {
      currentLeagueGroupId: null,
    });

    return group;
  }

  /**
   * Actualiza parcialmente la configuración o estado de un grupo de liga.
   *
   * Propósito: Modificar propiedades como activo o limiteMiembros.
   * @param id - Identificador del grupo.
   * @param updateDto - Campos a actualizar.
   * @returns Promise<LeagueGroupDocument> Grupo actualizado.
   */
  async update(
    id: string,
    updateDto: UpdateLeagueGroupDto,
  ): Promise<LeagueGroupDocument> {
    this.validateObjectId(id);

    const updated = await this.leagueGroupModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Grupo de liga con ID "${id}" no encontrado.`);
    }

    return updated;
  }

  /**
   * Elimina un grupo de liga de la base de datos.
   *
   * Propósito: Borrar registros de grupos obsoletos o pruebas.
   * @param id - Identificador del grupo.
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deleted = await this.leagueGroupModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Grupo de liga con ID "${id}" no encontrado.`);
    }

    return {
      message: 'Grupo de liga eliminado exitosamente.',
      deletedId: id,
    };
  }

  /**
   * Valida que una cadena cumpla el formato de ObjectId de MongoDB.
   *
   * @param id - Cadena a validar.
   * @throws BadRequestException Si el formato no es válido.
   */
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        `El identificador "${id}" no tiene un formato válido de ObjectId de MongoDB.`,
      );
    }
  }
}
