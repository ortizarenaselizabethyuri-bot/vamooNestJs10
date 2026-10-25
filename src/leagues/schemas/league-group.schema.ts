import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { UserRank } from '../../users/enums/user-rank.enum.js';

/**
 * Tipo que representa el documento de Mongoose para LeagueGroup.
 */
export type LeagueGroupDocument = HydratedDocument<LeagueGroup>;

/**
 * Esquema de MongoDB para los grupos de liga semanal.
 *
 * Propósito: Agrupar de forma semanal a aproximadamente 30 usuarios del mismo rango,
 * facilitando la competencia por puestos de ascenso y descenso en cada ciclo.
 */
@Schema({
  timestamps: true,
  collection: 'league_groups',
})
export class LeagueGroup {
  /**
   * Nivel o división de la liga a la que pertenece el grupo.
   */
  @Prop({
    type: String,
    enum: Object.values(UserRank),
    required: true,
    index: true,
  })
  rango: UserRank;

  /**
   * Identificador único del ciclo semanal (ej. "2026-W43").
   */
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  cicloSemanal: string;

  /**
   * Lista de usuarios que compiten en este grupo (máximo aproximado de 30 integrantes).
   */
  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
    default: [],
  })
  miembros: Types.ObjectId[];

  /**
   * Capacidad máxima recomendada de participantes por grupo de liga.
   */
  @Prop({
    type: Number,
    default: 30,
    min: 1,
  })
  limiteMiembros: number;

  /**
   * Estado de actividad del grupo para el ciclo actual.
   */
  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  activo: boolean;
}

/**
 * Fábrica de esquemas de Mongoose para la clase LeagueGroup.
 */
export const LeagueGroupSchema = SchemaFactory.createForClass(LeagueGroup);

// Índices compuestos para optimizar búsquedas por rango, ciclo y pertenencia
LeagueGroupSchema.index({ rango: 1, cicloSemanal: 1, activo: 1 });
LeagueGroupSchema.index({ miembros: 1, cicloSemanal: 1 });
