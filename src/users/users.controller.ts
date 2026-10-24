import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserDocument } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

/**
 * Controlador HTTP para el recurso de usuarios (/users).
 *
 * Propósito: Gestionar los endpoints REST del CRUD de usuarios, recibiendo
 * los datos de las peticiones HTTP y delegando la lógica al UsersService.
 */
@Controller('users')
export class UsersController {
  /**
   * Inyecta la instancia del servicio de usuarios.
   *
   * @param usersService - Servicio que contiene la lógica de negocio de usuarios.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint POST /users
   *
   * Propósito: Crear un nuevo usuario en la plataforma.
   * @param createUserDto - Datos validados del usuario a crear.
   * @returns Promise<UserDocument> El usuario creado.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Endpoint GET /users
   *
   * Propósito: Obtener el listado de todos los usuarios registrados.
   * @returns Promise<UserDocument[]> Arreglo de usuarios.
   */
  @Get()
  async findAll(): Promise<UserDocument[]> {
    return await this.usersService.findAll();
  }

  /**
   * Endpoint GET /users/:id
   *
   * Propósito: Obtener los detalles de un usuario en base a su ID de MongoDB.
   * @param id - Identificador único del usuario (_id).
   * @returns Promise<UserDocument> Documento del usuario encontrado.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDocument> {
    return await this.usersService.findById(id);
  }

  /**
   * Endpoint PATCH /users/:id
   *
   * Propósito: Actualizar uno o varios campos de un usuario existente.
   * @param id - Identificador único del usuario (_id).
   * @param updateUserDto - Datos con las propiedades a actualizar.
   * @returns Promise<UserDocument> Documento del usuario con los cambios aplicados.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Endpoint DELETE /users/:id
   *
   * Propósito: Eliminar un usuario de la base de datos por su ID.
   * @param id - Identificador único del usuario (_id).
   * @returns Promise<{ message: string; deletedId: string }> Mensaje de confirmación de eliminación.
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.usersService.remove(id);
  }
}
