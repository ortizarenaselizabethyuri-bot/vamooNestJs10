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
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddXpDto } from './dto/add-xp.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateFeaturedBadgesDto } from './dto/update-featured-badges.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserDocument } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

/**
 * Controlador HTTP para el recurso de usuarios (/users).
 *
 * Propósito: Gestionar los endpoints REST del CRUD de usuarios, recibiendo
 * los datos de las peticiones HTTP y delegando la lógica al UsersService.
 */
@ApiTags('users')
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
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Registra un usuario nuevo con validaciones de email único y valores iniciales de gamificación.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya existe.' })
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
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene el listado general de usuarios ordenados por fecha de creación.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.' })
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
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Busca un usuario por su identificador único de MongoDB.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
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
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Modifica parcialmente campos del usuario validando duplicidad de correo.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
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
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Remueve permanentemente el registro de un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    return await this.usersService.remove(id);
  }

  /**
   * Endpoint PATCH /users/:id/xp
   *
   * Propósito: Otorgar puntos de experiencia (XP) a un usuario, incrementando
   * simultáneamente el totalXp y leagueXp de manera atómica.
   * @param id - Identificador único del usuario (_id).
   * @param addXpDto - Cantidad de XP a sumar.
   * @returns Promise<UserDocument> Documento del usuario con la experiencia acumulada actualizada.
   */
  @Patch(':id/xp')
  @ApiOperation({
    summary: 'Sumar puntos de experiencia (XP)',
    description: 'Incrementa totalXp y leagueXp del usuario de forma atómica con $inc.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'XP sumada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async addXp(
    @Param('id') id: string,
    @Body() addXpDto: AddXpDto,
  ): Promise<UserDocument> {
    return await this.usersService.addXp(id, addXpDto.xp);
  }

  /**
   * Endpoint PATCH /users/:id/featured-badges
   *
   * Propósito: Actualizar las hasta 3 insignias o trofeos destacados que el usuario desea mostrar en su perfil.
   * @param id - Identificador único del usuario (_id).
   * @param updateBadgesDto - Arreglo de IDs de insignias a destacar.
   * @returns Promise<UserDocument> Documento de usuario con las insignias actualizadas.
   */
  @Patch(':id/featured-badges')
  @ApiOperation({
    summary: 'Actualizar insignias destacadas',
    description: 'Permite seleccionar hasta 3 insignias para lucir en el perfil público del usuario.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId de MongoDB del usuario' })
  @ApiResponse({ status: 200, description: 'Insignias destacadas actualizadas.' })
  @ApiResponse({ status: 400, description: 'Más de 3 insignias o formato de ID inválido.' })
  async updateFeaturedBadges(
    @Param('id') id: string,
    @Body() updateBadgesDto: UpdateFeaturedBadgesDto,
  ): Promise<UserDocument> {
    return await this.usersService.updateFeaturedBadges(
      id,
      updateBadgesDto.badgeIds,
    );
  }
}
