import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
   * Roles o permisos asignados al usuario (ej. 'user', 'admin').
   */
  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  /**
   * Estado activo/inactivo de la cuenta del usuario.
   */
  @Prop({ default: true })
  isActive: boolean;
}

/**
 * Fábrica de esquemas de Mongoose para la clase User.
 */
export const UserSchema = SchemaFactory.createForClass(User);
