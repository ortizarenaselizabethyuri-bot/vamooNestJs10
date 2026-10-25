import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { AchievementCategory } from '../enums/achievement-category.enum.js';
import { AchievementType } from '../enums/achievement-type.enum.js';

/**
 * Tipo que representa el documento de Mongoose para Achievement.
 */
export type AchievementDocument = HydratedDocument<Achievement>;

/**
 * Esquema de MongoDB para las insignias y trofeos otorgados a los usuarios.
 *
 * Propósito: Gestionar el historial de condecoraciones ganadas por completar rutas,
 * ascender de rango en ligas semanales, mantener rachas o participar en eventos de edición limitada.
 */
@Schema({
  timestamps: true,
  collection: 'achievements',
})
export class Achievement {
  /**
   * Identificador del usuario que obtuvo la insignia o trofeo.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  usuarioId: Types.ObjectId;

  /**
   * Tipo de galardón (insignia por ruta/acción o trofeo por logro competitivo).
   */
  @Prop({
    type: String,
    enum: Object.values(AchievementType),
    required: true,
    index: true,
  })
  tipo: AchievementType;

  /**
   * Título representativo del logro (ej. "Conquistador de Pantanos", "Campeón Liga Flamenco").
   */
  @Prop({
    required: true,
    trim: true,
  })
  titulo: string;

  /**
   * Descripción de los requisitos cumplidos para desbloquear la insignia o trofeo.
   */
  @Prop({
    required: true,
    trim: true,
  })
  descripcion: string;

  /**
   * Categoría a la que pertenece la condecoración.
   */
  @Prop({
    type: String,
    enum: Object.values(AchievementCategory),
    required: true,
    index: true,
  })
  categoria: AchievementCategory;

  /**
   * URL de la imagen, icono o medalla visual del logro.
   */
  @Prop({
    type: String,
    default: null,
    trim: true,
  })
  iconoUrl?: string;

  /**
   * Indica si la insignia corresponde a una temporada o evento especial limitado.
   */
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  esEdicionLimitada: boolean;

  /**
   * Fecha y hora exacta en la que el usuario desbloqueó el logro.
   */
  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  fechaObtencion: Date;

  /**
   * Identificador de la ruta asociada, si la insignia fue obtenida completando un recorrido específico.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Route',
    default: null,
  })
  rutaId?: Types.ObjectId;
}

/**
 * Fábrica de esquemas de Mongoose para la clase Achievement.
 */
export const AchievementSchema = SchemaFactory.createForClass(Achievement);

// Índices para optimizar listados de perfil y verificación de duplicados
AchievementSchema.index({ usuarioId: 1, fechaObtencion: -1 });
AchievementSchema.index({ usuarioId: 1, categoria: 1 });
AchievementSchema.index({ usuarioId: 1, titulo: 1 });
