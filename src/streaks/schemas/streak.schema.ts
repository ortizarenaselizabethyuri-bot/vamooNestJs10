import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

/**
 * Tipo que representa el documento de Mongoose para Streak.
 */
export type StreakDocument = HydratedDocument<Streak>;

/**
 * Esquema de MongoDB para el seguimiento de rachas semanales de constancia.
 *
 * Propósito: Gestionar el progreso semanal del usuario, protegiendo su constancia
 * mediante descansos programados (congelamiento de racha) e hitos alcanzados (4, 12, 24 semanas).
 */
@Schema({
  timestamps: true,
  collection: 'streaks',
})
export class Streak {
  /**
   * Identificador del usuario al que pertenece la racha.
   * Debe ser único para asegurar una sola entidad de racha por usuario.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  usuarioId: Types.ObjectId;

  /**
   * Cantidad de semanas consecutivas completando la meta de salidas.
   */
  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  semanasConsecutivas: number;

  /**
   * Cantidad de salidas válidas registradas durante el ciclo semanal en curso.
   */
  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  salidasValidasSemana: number;

  /**
   * Meta de salidas requeridas por semana para mantener la racha activa (por defecto 3).
   */
  @Prop({
    type: Number,
    default: 3,
    min: 1,
  })
  metaSemanal: number;

  /**
   * Identificador del ciclo semanal actual evaluado (ej. "2026-W43").
   */
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  semanaActual: string;

  /**
   * Días de descanso o comodines disponibles para congelar la racha sin perder el progreso.
   */
  @Prop({
    type: Number,
    default: 2,
    min: 0,
  })
  diasDescansoRestantes: number;

  /**
   * Indica si la racha se encuentra congelada para la semana actual.
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  congelada: boolean;

  /**
   * Registro histórico de los hitos de semanas alcanzados (ej. [4, 12, 24]).
   */
  @Prop({
    type: [Number],
    default: [],
  })
  hitosAlcanzados: number[];

  /**
   * Fecha y hora en la que se registró la última salida válida.
   */
  @Prop({
    type: Date,
    default: null,
  })
  ultimaFechaSalida?: Date;
}

/**
 * Fábrica de esquemas de Mongoose para la clase Streak.
 */
export const StreakSchema = SchemaFactory.createForClass(Streak);
