import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { UsersService } from '../users/users.service.js';
import { CreateStreakDto } from './dto/create-streak.dto.js';
import { UpdateStreakDto } from './dto/update-streak.dto.js';
import { Streak, StreakDocument } from './schemas/streak.schema.js';

/**
 * Servicio encargado de la lógica de negocio de rachas semanales (Streaks).
 *
 * Propósito: Fomentar el hábito de actividad física semanal sin generar ansiedad diaria,
 * administrando congelamientos de racha, hitos (4, 12, 24 semanas) y transiciones de ciclo.
 */
@Injectable()
export class StreaksService {
  private readonly logger = new Logger(StreaksService.name);

  /**
   * Inyecta el modelo de Mongoose para Streak y el servicio de usuarios.
   *
   * @param streakModel - Modelo de Mongoose para la colección 'streaks'.
   * @param usersService - Servicio de usuarios para validar existencia.
   */
  constructor(
    @InjectModel(Streak.name)
    private readonly streakModel: Model<StreakDocument>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Obtiene la clave del ciclo semanal actual en formato ISO (ej. "2026-W43").
   *
   * Propósito: Estandarizar el cálculo del identificador de semana a partir de una fecha.
   * @param date - Fecha de referencia (por defecto la fecha actual).
   * @returns string Identificador de semana (ej. "2026-W43").
   */
  getCurrentWeekCycle(date: Date = new Date()): string {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    // En ISO, la semana comienza el lunes; ajustar al jueves más cercano
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    );
    return `${tempDate.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene o inicializa la racha de un usuario para el ciclo semanal actual.
   *
   * Propósito: Garantizar que cualquier usuario tenga un registro de racha disponible al ingresar.
   * @param userId - Identificador de MongoDB (_id) del usuario.
   * @returns Promise<StreakDocument> Registro de la racha del usuario.
   */
  async getOrCreateUserStreak(userId: string): Promise<StreakDocument> {
    this.validateObjectId(userId);
    await this.usersService.findById(userId);

    const currentWeek = this.getCurrentWeekCycle();
    const existingStreak = await this.streakModel
      .findOne({ usuarioId: userId })
      .exec();

    if (!existingStreak) {
      const newStreak = new this.streakModel({
        usuarioId: userId,
        semanasConsecutivas: 0,
        salidasValidasSemana: 0,
        metaSemanal: 3,
        semanaActual: currentWeek,
        diasDescansoRestantes: 2,
        congelada: false,
        hitosAlcanzados: [],
      });
      return await newStreak.save();
    }

    // Si la semana registrada es anterior a la actual, procesar el cambio de ciclo semanal
    if (existingStreak.semanaActual !== currentWeek) {
      return await this.processWeeklyRollover(existingStreak, currentWeek);
    }

    return existingStreak;
  }

  /**
   * Registra una salida válida en la racha semanal del usuario.
   *
   * Propósito: Contabilizar una salida física, verificar si se alcanza la meta de 3 salidas
   * en la semana, incrementar las semanas consecutivas y premiar hitos (4, 12 o 24 semanas).
   * @param userId - Identificador del usuario.
   * @param semana - Semana a computar (opcional).
   * @returns Promise<StreakDocument> Racha actualizada con el progreso.
   */
  async recordValidOuting(
    userId: string,
    semana?: string,
  ): Promise<StreakDocument> {
    const streak = await this.getOrCreateUserStreak(userId);
    const targetWeek = semana || this.getCurrentWeekCycle();

    if (streak.semanaActual !== targetWeek) {
      await this.processWeeklyRollover(streak, targetWeek);
    }

    const previousOutings = streak.salidasValidasSemana;
    streak.salidasValidasSemana += 1;
    streak.ultimaFechaSalida = new Date();

    // Si con esta salida se alcanza exactamente la meta semanal (ej. 3), se consolida la semana
    if (
      previousOutings < streak.metaSemanal &&
      streak.salidasValidasSemana >= streak.metaSemanal
    ) {
      streak.semanasConsecutivas += 1;

      // Verificar hitos de 4, 12 o 24 semanas
      const hitos = [4, 12, 24];
      for (const hito of hitos) {
        if (
          streak.semanasConsecutivas >= hito &&
          !streak.hitosAlcanzados.includes(hito)
        ) {
          streak.hitosAlcanzados.push(hito);
          this.logger.log(`🏆 ¡Hito alcanzado por usuario ${userId}! ${hito} semanas de constancia consecutivas.`);
        }
      }
    }

    const saved = await streak.save();
    this.logger.log(
      `🔥 Salida registrada para usuario ${userId}: ${saved.salidasValidasSemana}/${saved.metaSemanal} en semana ${saved.semanaActual}. Semanas consecutivas: ${saved.semanasConsecutivas}`,
    );
    return saved;
  }

  /**
   * Congela la racha semanal del usuario consumiendo un día de descanso.
   *
   * Propósito: Permitir al usuario proteger su racha ante viajes, lesiones o descanso programado.
   * @param userId - Identificador del usuario.
   * @returns Promise<StreakDocument> Racha congelada.
   * @throws BadRequestException Si no cuenta con días de descanso disponibles o ya está congelada.
   */
  async freezeStreak(userId: string): Promise<StreakDocument> {
    const streak = await this.getOrCreateUserStreak(userId);

    if (streak.congelada) {
      throw new BadRequestException('La racha ya se encuentra congelada para esta semana.');
    }

    if (streak.diasDescansoRestantes <= 0) {
      throw new BadRequestException(
        'No cuentas con días de descanso restantes para congelar la racha.',
      );
    }

    streak.diasDescansoRestantes -= 1;
    streak.congelada = true;

    const saved = await streak.save();
    this.logger.log(`❄️ Racha congelada para usuario ${userId}. Días de descanso restantes: ${saved.diasDescansoRestantes}`);
    return saved;
  }

  /**
   * Descongela la racha del usuario reactivando la exigencia semanal.
   *
   * Propósito: Reanudar la contabilización activa si el usuario decide entrenar anticipadamente.
   * @param userId - Identificador del usuario.
   * @returns Promise<StreakDocument> Racha descongelada.
   */
  async unfreezeStreak(userId: string): Promise<StreakDocument> {
    const streak = await this.getOrCreateUserStreak(userId);

    if (!streak.congelada) {
      throw new BadRequestException('La racha no se encuentra congelada.');
    }

    streak.congelada = false;
    const saved = await streak.save();
    this.logger.log(`☀️ Racha descongelada para usuario ${userId}.`);
    return saved;
  }

  /**
   * Procesa el cambio de ciclo semanal (rollover) para un documento de racha.
   *
   * Propósito: Evaluar si el usuario cumplió la meta de la semana anterior o la protegió con congelamiento;
   * si no la cumplió, la racha consecutiva se reinicia a 0.
   * @param streak - Documento de la racha a procesar.
   * @param newWeek - Nuevo ciclo semanal (ej. "2026-W44").
   * @returns Promise<StreakDocument> Documento de racha ajustado para la nueva semana.
   */
  private async processWeeklyRollover(
    streak: StreakDocument,
    newWeek: string,
  ): Promise<StreakDocument> {
    // Si la semana previa no se completó y tampoco estuvo congelada, la racha consecutiva se pierde
    if (!streak.congelada && streak.salidasValidasSemana < streak.metaSemanal) {
      this.logger.warn(
        `💔 Usuario ${streak.usuarioId} perdió su racha de ${streak.semanasConsecutivas} semanas por inactividad.`,
      );
      streak.semanasConsecutivas = 0;
    }

    // Reiniciar contadores para la nueva semana
    streak.semanaActual = newWeek;
    streak.salidasValidasSemana = 0;
    streak.congelada = false;

    // Reponer un día de descanso hasta un tope de 2
    streak.diasDescansoRestantes = Math.min(2, streak.diasDescansoRestantes + 1);

    await streak.save();
    this.logger.log(`📅 Transición de racha para usuario ${streak.usuarioId} al ciclo ${newWeek}`);
    return streak;
  }

  /**
   * Crea un nuevo registro de racha para un usuario.
   *
   * Propósito: Creación manual administrativa de racha.
   * @param createDto - Datos de la racha.
   * @returns Promise<StreakDocument> Documento de racha creado.
   */
  async create(createDto: CreateStreakDto): Promise<StreakDocument> {
    this.validateObjectId(createDto.usuarioId);

    const existing = await this.streakModel.findOne({
      usuarioId: createDto.usuarioId,
    });
    if (existing) {
      throw new ConflictException('El usuario ya posee un registro de racha existente.');
    }

    const newStreak = new this.streakModel(createDto);
    return await newStreak.save();
  }

  /**
   * Lista todos los registros de racha registrados en la plataforma.
   *
   * Propósito: Auditoría general y monitoreo de constancia de usuarios.
   * @returns Promise<StreakDocument[]> Lista de rachas.
   */
  async findAll(): Promise<StreakDocument[]> {
    return await this.streakModel
      .find()
      .populate('usuarioId', 'name email picture currentRank')
      .sort({ semanasConsecutivas: -1 })
      .exec();
  }

  /**
   * Busca el registro de racha por su ID único de MongoDB.
   *
   * @param id - Identificador de MongoDB (_id).
   * @returns Promise<StreakDocument> Documento de racha.
   */
  async findById(id: string): Promise<StreakDocument> {
    this.validateObjectId(id);

    const streak = await this.streakModel
      .findById(id)
      .populate('usuarioId', 'name email picture currentRank')
      .exec();

    if (!streak) {
      throw new NotFoundException(`Racha con ID "${id}" no encontrada.`);
    }

    return streak;
  }

  /**
   * Busca la racha de un usuario por su identificador de usuario.
   *
   * @param userId - Identificador del usuario (_id).
   * @returns Promise<StreakDocument> Racha del usuario.
   */
  async findByUserId(userId: string): Promise<StreakDocument> {
    return await this.getOrCreateUserStreak(userId);
  }

  /**
   * Actualiza parcialmente los campos de una racha.
   *
   * @param id - Identificador de la racha (_id).
   * @param updateDto - Campos a modificar.
   * @returns Promise<StreakDocument> Racha modificada.
   */
  async update(
    id: string,
    updateDto: UpdateStreakDto,
  ): Promise<StreakDocument> {
    this.validateObjectId(id);

    const updated = await this.streakModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('usuarioId', 'name email picture currentRank')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Racha con ID "${id}" no encontrada.`);
    }

    return updated;
  }

  /**
   * Elimina un registro de racha por su ID.
   *
   * @param id - Identificador de la racha (_id).
   * @returns Promise<{ message: string; deletedId: string }> Confirmación de eliminación.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deleted = await this.streakModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Racha con ID "${id}" no encontrada.`);
    }

    return {
      message: 'Registro de racha eliminado exitosamente.',
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
