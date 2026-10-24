import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User, UserDocument } from './schemas/user.schema.js';

/**
 * Servicio encargado de la lógica de negocio para la gestión de usuarios.
 *
 * Propósito: Proveer operaciones CRUD y métodos de consulta especializados
 * sobre la colección de usuarios en MongoDB utilizando Mongoose.
 */
@Injectable()
export class UsersService {
  /**
   * Inyecta el modelo de Mongoose para la entidad User.
   *
   * @param userModel - Modelo de Mongoose para interactuar con la colección 'users'.
   */
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Registra o crea un nuevo usuario en la base de datos.
   *
   * Propósito: Validar que no exista un usuario con el mismo email antes de persistirlo.
   * @param createUserDto - Datos de entrada para crear el usuario.
   * @returns Promise<UserDocument> Documento del usuario creado.
   * @throws ConflictException Si el correo electrónico ya está registrado.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException(
        `El correo electrónico "${createUserDto.email}" ya se encuentra registrado.`,
      );
    }

    const newUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });

    return await newUser.save();
  }

  /**
   * Obtiene la lista completa de usuarios registrados.
   *
   * Propósito: Consultar todos los documentos de usuarios ordenados por fecha de creación descendente.
   * @returns Promise<UserDocument[]> Lista de documentos de usuario.
   */
  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Busca y obtiene un usuario por su identificador único de MongoDB (_id).
   *
   * Propósito: Recuperar los datos de un usuario específico validando el formato del ID.
   * @param id - Identificador hexadecimal único de MongoDB (_id).
   * @returns Promise<UserDocument> Documento del usuario encontrado.
   * @throws BadRequestException Si el ID no tiene formato válido de ObjectId.
   * @throws NotFoundException Si no existe un usuario con el ID proporcionado.
   */
  async findById(id: string): Promise<UserDocument> {
    this.validateObjectId(id);

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return user;
  }

  /**
   * Busca un usuario por su dirección de correo electrónico.
   *
   * Propósito: Facilitar la búsqueda para flujos de autenticación o validación previa.
   * @param email - Correo electrónico a buscar.
   * @returns Promise<UserDocument | null> Documento encontrado o null si no existe.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Busca un usuario por su ID de Google OAuth.
   *
   * Propósito: Permitir la autenticación federada con Google.
   * @param googleId - Identificador único de Google.
   * @returns Promise<UserDocument | null> Documento del usuario asociado o null.
   */
  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ googleId }).exec();
  }

  /**
   * Busca un usuario por email incluyendo el campo de contraseña ('password')
   * que normalmente está excluido por defecto con select: false.
   *
   * Propósito: Permitir la verificación de contraseñas durante el inicio de sesión.
   * @param email - Correo electrónico del usuario.
   * @returns Promise<UserDocument | null> Documento del usuario con el campo password.
   */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  /**
   * Busca un usuario por googleId o email; si existe por email le asocia el googleId,
   * y si no existe crea un nuevo registro.
   *
   * Propósito: Garantizar un flujo fluido de inicio de sesión con Google OAuth 2.0.
   * @param profile - Información obtenida del perfil de Google (googleId, email, name, picture).
   * @returns Promise<UserDocument> Documento de usuario autenticado o registrado.
   */
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<UserDocument> {
    let user = await this.findByGoogleId(profile.googleId);
    if (user) {
      return user;
    }

    user = await this.findByEmail(profile.email);
    if (user) {
      user.googleId = profile.googleId;
      if (!user.picture && profile.picture) {
        user.picture = profile.picture;
      }
      return await user.save();
    }

    const newUser = new this.userModel({
      name: profile.name,
      email: profile.email.toLowerCase(),
      googleId: profile.googleId,
      picture: profile.picture,
      isActive: true,
      roles: ['user'],
    });

    return await newUser.save();
  }


  /**
   * Actualiza parcialmente la información de un usuario existente.
   *
   * Propósito: Aplicar cambios sobre un usuario validando ID y duplicidad de correo si cambia.
   * @param id - Identificador único de MongoDB (_id).
   * @param updateUserDto - Datos con los campos que se desean actualizar.
   * @returns Promise<UserDocument> Documento actualizado del usuario.
   * @throws BadRequestException Si el ID no es válido.
   * @throws ConflictException Si el nuevo email ya está en uso por otro usuario.
   * @throws NotFoundException Si el usuario no existe.
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    this.validateObjectId(id);

    if (updateUserDto.email) {
      const emailInUse = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailInUse) {
        throw new ConflictException(
          `El correo "${updateUserDto.email}" ya está siendo utilizado por otro usuario.`,
        );
      }
    }

    const payload = {
      ...updateUserDto,
      ...(updateUserDto.email && { email: updateUserDto.email.toLowerCase() }),
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return updatedUser;
  }

  /**
   * Elimina un usuario de la base de datos por su ID.
   *
   * Propósito: Remover el registro del usuario en la colección.
   * @param id - Identificador único de MongoDB (_id).
   * @returns Promise<{ message: string; deletedId: string }> Mensaje de confirmación y el ID eliminado.
   * @throws BadRequestException Si el ID no es válido.
   * @throws NotFoundException Si el usuario no existe.
   */
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    this.validateObjectId(id);

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return {
      message: 'Usuario eliminado exitosamente.',
      deletedId: id,
    };
  }

  /**
   * Valida que un string tenga el formato correcto de un ObjectId de MongoDB.
   *
   * @param id - Cadena a evaluar.
   * @throws BadRequestException Si el formato no corresponde a un ObjectId.
   */
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        `El identificador "${id}" no tiene un formato válido de ObjectId de MongoDB.`,
      );
    }
  }
}
