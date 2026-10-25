import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

/**
 * Servicio encargado de la lógica de autenticación, generación y validación de tokens JWT.
 *
 * Propósito: Gestionar el registro y login con credenciales locales (bcrypt),
 * la emisión de JSON Web Tokens y la autenticación federada con Google.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Inyecta UsersService y JwtService.
   *
   * @param usersService - Servicio para consultar y registrar usuarios en la base de datos.
   * @param jwtService - Servicio de NestJS para firmar y verificar tokens JWT.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario con contraseña hasheada y le emite un token de acceso inicial.
   *
   * Propósito: Permitir el registro directo validando no duplicidad y protegiendo la contraseña con bcrypt.
   * @param registerDto - Datos validados de registro (nombre, email, contraseña).
   * @returns Promise<{ user: any; accessToken: string }> Datos públicos del usuario y token JWT.
   * @throws ConflictException Si el correo ya está registrado.
   */
  async register(registerDto: RegisterDto): Promise<{ user: any; accessToken: string }> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException(
        `El correo "${registerDto.email}" ya se encuentra registrado.`,
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      roles: ['user'],
      isActive: true,
    });

    this.logger.log(`👤 Nuevo usuario registrado: ${newUser.email} (ID: ${newUser._id})`);
    const accessToken = this.generateToken(newUser);

    return {
      user: this.sanitizeUser(newUser),
      accessToken,
    };
  }

  /**
   * Autentica a un usuario mediante sus credenciales locales (email y contraseña).
   *
   * Propósito: Validar que el usuario exista, su cuenta esté activa y la contraseña coincida.
   * @param loginDto - Credenciales enviadas por el usuario.
   * @returns Promise<{ user: any; accessToken: string }> Usuario autenticado y token JWT.
   * @throws UnauthorizedException Si las credenciales no son válidas o la cuenta está inactiva.
   */
  async login(loginDto: LoginDto): Promise<{ user: any; accessToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      this.logger.warn(`Intento fallido de login: usuario no encontrado (${loginDto.email})`);
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Esta cuenta fue registrada mediante un proveedor externo (Google). Por favor, inicia sesión con Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Intento fallido de login: contraseña incorrecta (${loginDto.email})`);
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.isActive) {
      this.logger.warn(`Intento de login con cuenta inactiva (${loginDto.email})`);
      throw new UnauthorizedException(
        'Tu cuenta se encuentra inactiva. Contacta al administrador.',
      );
    }

    this.logger.log(`🔑 Sesión local iniciada: ${user.email} (ID: ${user._id})`);
    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Finaliza el inicio de sesión para un usuario autenticado a través de Google OAuth.
   *
   * Propósito: Emitir el token JWT para la sesión generada por Google.
   * @param user - Documento del usuario retornado por GoogleStrategy.
   * @returns { user: any; accessToken: string } Información del usuario y token JWT.
   */
  loginWithGoogle(user: UserDocument): { user: any; accessToken: string } {
    this.logger.log(`🌐 Sesión iniciada con Google OAuth: ${user.email} (ID: ${user._id})`);
    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Genera y firma un JSON Web Token (JWT) con la información del usuario.
   *
   * Propósito: Crear la firma criptográfica para el acceso a rutas protegidas.
   * @param user - Documento de usuario de Mongoose.
   * @returns string Token JWT firmado.
   */
  generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Limpia información sensible (como contraseñas) antes de responder al cliente.
   *
   * @param user - Documento de Mongoose del usuario.
   * @returns Objeto plano sin contraseñas ni campos internos.
   */
  private sanitizeUser(user: UserDocument): any {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    return obj;
  }
}
