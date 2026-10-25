import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { UserRank } from '../enums/user-rank.enum.js';

/**
 * Tipo que representa el documento de Mongoose para User.
 */
export type UserDocument = HydratedDocument<User>;

/**
 * Esquema de MongoDB para la colección de usuarios.
 *
 * Propósito: Definir la estructura, tipos, validaciones y opciones
 * del modelo de datos de usuario en la base de datos MongoDB.
 */
@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  /**
   * Nombre completo o nombre de visualización del usuario.
   */
  @Prop({ required: true, trim: true })
  name: string;

  /**
   * Dirección de correo electrónico único del usuario.
   */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  /**
   * Contraseña encriptada para autenticación local.
   * Opcional para usuarios que se autentican exclusivamente mediante OAuth (Google).
   */
  @Prop({ required: false, select: false })
  password?: string;

  /**
   * URL de la imagen de perfil o avatar del usuario.
   */
  @Prop({ required: false, default: null })
  picture?: string;

  /**
   * Identificador único de Google para inicios de sesión con OAuth Google.
   */
  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  /**
   * Roles o permisos asignados al usuario en la plataforma (ej. 'user', 'admin').
   */
  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  /**
   * Estado activo/inactivo de la cuenta del usuario.
   */
  @Prop({ default: true })
  isActive: boolean;

  /**
   * Nivel o rango actual de liga del usuario.
   */
  @Prop({
    type: String,
    enum: Object.values(UserRank),
    default: UserRank.PICHON,
  })
  currentRank: UserRank;

  /**
   * Puntos de experiencia (XP) acumulados históricamente. Nunca disminuyen.
   */
  @Prop({ type: Number, default: 0, min: 0 })
  totalXp: number;

  /**
   * Puntos de experiencia (XP) obtenidos en el ciclo semanal actual.
   * Se reinicia a 0 al finalizar cada semana.
   */
  @Prop({ type: Number, default: 0, min: 0 })
  leagueXp: number;

  /**
   * Indica si el usuario no registró actividad en la semana previa
   * y queda fuera del ranking competitivo de la liga semanal.
   */
  @Prop({ type: Boolean, default: false })
  isPaused: boolean;

  /**
   * Lista de hasta 3 insignias o trofeos destacados que el usuario exhibe en su perfil.
   */
  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Achievement' }],
    default: [],
    validate: [
      (val: Types.ObjectId[]) => val.length <= 3,
      'Las insignias destacadas no pueden exceder un máximo de 3.',
    ],
  })
  featuredBadges: Types.ObjectId[];

  /**
   * Identificador del grupo de liga semanal activo al que pertenece el usuario.
   */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'LeagueGroup',
    default: null,
  })
  currentLeagueGroupId?: Types.ObjectId;
}

/**
 * Fábrica de esquemas de Mongoose para la clase User.
 */
export const UserSchema = SchemaFactory.createForClass(User);
