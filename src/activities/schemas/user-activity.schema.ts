import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

/**
 * Tipo que representa el documento de Mongoose para UserActivity.
 */
export type UserActivityDocument = HydratedDocument<UserActivity>;

/**
 * Esquema de MongoDB para el registro de salidas y actividades físicas del usuario.
 *
 * Propósito: Registrar cada interacción, recorrido o caminata libre del usuario,
 * auditando las validaciones de GPS/QR y aplicando las reglas de bonificación de experiencia (XP).
 */
@Schema({
  timestamps: true,
  collection: 'user_activities',
})
export class UserActivity {
  /**
   * Identificador del usuario que realizó la actividad.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  usuarioId: Types.ObjectId;

  /**
   * Identificador de la ruta o punto de interés completado.
   * Opcional si se trata de una caminata o recorrido libre.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Route',
    default: null,
    index: true,
  })
  rutaId?: Types.ObjectId;

  /**
   * Distancia recorrida en kilómetros durante la actividad.
   */
  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0,
  })
  distanciaKm: number;

  /**
   * Duración aproximada de la actividad en minutos.
   */
  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  duracionMinutos: number;

  /**
   * Indica si es la primera vez que el usuario visita la ruta o punto de interés
   * (otorga 50 XP la primera vez; 5 XP si ya fue visitado previamente).
   */
  @Prop({
    type: Boolean,
    default: true,
  })
  esLugarNuevo: boolean;

  /**
   * Indica si la actividad se realizó en compañía de otro usuario
   * (activa el bonus multiplicador del +20% de XP).
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  acompanado: boolean;

  /**
   * Puntos de experiencia (XP) totales ganados en la sesión, calculados con base y bonus.
   */
  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  xpGanada: number;

  /**
   * Indica si la salida fue confirmada mediante coordenadas GPS válidas.
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  validadoPorGPS: boolean;

  /**
   * Indica si la salida fue confirmada mediante escaneo de código QR en local aliado.
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  validadoPorQR: boolean;

  /**
   * Fecha y hora en la que se realizó la actividad física.
   */
  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  fecha: Date;
}

/**
 * Fábrica de esquemas de Mongoose para la clase UserActivity.
 */
export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

// Índices para optimizar consultas de historial de usuario y comprobación de primer lugar
UserActivitySchema.index({ usuarioId: 1, fecha: -1 });
UserActivitySchema.index({ usuarioId: 1, rutaId: 1 });
