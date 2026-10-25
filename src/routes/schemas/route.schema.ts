import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RouteType } from '../enums/route-type.enum.js';

/**
 * Tipo que representa el documento de Mongoose para Route.
 */
export type RouteDocument = HydratedDocument<Route>;

/**
 * Esquema de MongoDB para los destinos, rutas y puntos de interés.
 *
 * Propósito: Gestionar la información geográfica, requerimientos de permanencia,
 * códigos QR de aliados y bonificaciones de experiencia (XP) otorgadas.
 */
@Schema({
  timestamps: true,
  collection: 'routes',
})
export class Route {
  /**
   * Nombre identificador del destino o recorrido (ej. "Ruta del flamenco en Pantanos de Villa").
   */
  @Prop({ required: true, trim: true })
  nombre: string;

  /**
   * Descripción informativa del recorrido, fauna observable o recomendaciones.
   */
  @Prop({ default: '', trim: true })
  descripcion: string;

  /**
   * Tipo de ruta (predeterminada o evento especial).
   */
  @Prop({
    type: String,
    enum: Object.values(RouteType),
    default: RouteType.PREDETERMINADA,
    index: true,
  })
  tipo: RouteType;

  /**
   * Cantidad base de puntos de experiencia (XP) que otorga completar la ruta
   * (ej. 100 XP para predeterminadas, 150 XP para eventos especiales).
   */
  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 100,
  })
  xpOtorgada: number;

  /**
   * Punto geográfico GeoJSON Point [longitud, latitud].
   * Nota crítica: En GeoJSON y MongoDB el primer elemento es la longitud y el segundo la latitud.
   */
  @Prop(
    raw({
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    }),
  )
  ubicacion: {
    type: string;
    coordinates: [number, number]; // [longitud, latitud]
  };

  /**
   * Tiempo mínimo sugerido o requerido de permanencia en el sitio (en minutos, ej. 10).
   */
  @Prop({
    type: Number,
    default: 10,
    min: 0,
  })
  tiempoMinimoMinutos: number;

  /**
   * Indica si el punto corresponde a un establecimiento o negocio local aliado.
   */
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  esLocalAliado: boolean;

  /**
   * Código alfanumérico o payload único para validar la visita mediante código QR en locales aliados.
   */
  @Prop({
    type: String,
    sparse: true,
    trim: true,
    default: null,
  })
  codigoQR?: string;

  /**
   * Indica si es una ruta temporal o de temporada (ej. Avistamiento de ballenas).
   */
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  esEdicionLimitada: boolean;

  /**
   * Estado de disponibilidad de la ruta para los usuarios.
   */
  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  activo: boolean;
}

/**
 * Fábrica de esquemas de Mongoose para la clase Route.
 */
export const RouteSchema = SchemaFactory.createForClass(Route);

// Índice geoespacial 2dsphere para consultas por proximidad ($near, $geoWithin)
RouteSchema.index({ ubicacion: '2dsphere' });
RouteSchema.index({ esLocalAliado: 1, activo: 1 });
RouteSchema.index({ tipo: 1, activo: 1 });
