import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AchievementCategory } from '../enums/achievement-category.enum.js';
import { AchievementType } from '../enums/achievement-type.enum.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación u otorgamiento de un logro.
 *
 * Propósito: Validar que los campos de tipo, categoría, título y destinatario sean correctos.
 */
export class CreateAchievementDto {
  /**
   * Identificador del usuario que recibe el logro.
   */
  @IsMongoId({ message: 'El usuarioId debe ser un ObjectId válido de MongoDB.' })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio.' })
  readonly usuarioId: string;

  /**
   * Tipo de galardón (insignia o trofeo).
   */
  @IsEnum(AchievementType, {
    message: 'El tipo debe ser "insignia" o "trofeo".',
  })
  @IsNotEmpty({ message: 'El tipo es obligatorio.' })
  readonly tipo: AchievementType;

  /**
   * Título de la insignia o trofeo.
   */
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  readonly titulo: string;

  /**
   * Descripción explicativa del logro alcanzado.
   */
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  readonly descripcion: string;

  /**
   * Categoría del logro (ruta_permanente, evento_especial, hito_racha, campeon_liga).
   */
  @IsEnum(AchievementCategory, {
    message:
      'La categoría debe ser: ruta_permanente, evento_especial, hito_racha o campeon_liga.',
  })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  readonly categoria: AchievementCategory;

  /**
   * URL de la imagen del icono o trofeo (opcional).
   */
  @IsString({ message: 'La iconoUrl debe ser una cadena de texto.' })
  @IsOptional()
  readonly iconoUrl?: string;

  /**
   * Indica si la insignia es de edición limitada o de temporada.
   */
  @IsBoolean({ message: 'El campo esEdicionLimitada debe ser booleano.' })
  @IsOptional()
  readonly esEdicionLimitada?: boolean;

  /**
   * Identificador de la ruta asociada (opcional).
   */
  @IsMongoId({ message: 'El rutaId debe ser un ObjectId válido de MongoDB.' })
  @IsOptional()
  readonly rutaId?: string;

  /**
   * Fecha de obtención (opcional, por defecto momento de creación).
   */
  @IsDateString({}, { message: 'La fechaObtencion debe tener formato ISO 8601.' })
  @IsOptional()
  readonly fechaObtencion?: string;
}
