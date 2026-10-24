import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserDocument } from '../users/schemas/user.schema.js';
import { AuthService } from './auth.service.js';
import { GetUser } from './decorators/get-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

/**
 * Controlador de autenticación (/auth).
 *
 * Propósito: Exponer los endpoints HTTP para registro, inicio de sesión local,
 * flujo de Google OAuth y consulta de perfil protegido con JWT.
 */
@Controller('auth')
export class AuthController {
  /**
   * Inyecta la instancia del servicio de autenticación.
   *
   * @param authService - Servicio con lógica de JWT, contraseñas y OAuth.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint POST /auth/register
   *
   * Propósito: Registrar un nuevo usuario en la base de datos con contraseña encriptada.
   * @param registerDto - Datos de registro (name, email, password).
   * @returns Datos del usuario creado y token JWT de acceso.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Endpoint POST /auth/login
   *
   * Propósito: Autenticar credenciales locales y emitir un token JWT.
   * @param loginDto - Credenciales (email, password).
   * @returns Datos del usuario autenticado y token JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Endpoint GET /auth/google
   *
   * Propósito: Redirigir al cliente a la página de inicio de sesión de Google OAuth 2.0.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // El GoogleAuthGuard redirige automáticamente al flujo de Google
  }

  /**
   * Endpoint GET /auth/google/callback
   *
   * Propósito: Recibir la respuesta de autorización de Google, autenticar/registrar
   * al usuario y responder con el token JWT de acceso.
   * @param req - Request con el usuario validado en req.user por GoogleStrategy.
   * @returns Usuario autenticado y token JWT emitido por la aplicación.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any) {
    return this.authService.loginWithGoogle(req.user);
  }

  /**
   * Endpoint GET /auth/profile
   *
   * Propósito: Endpoint de prueba protegido con JWT. Demuestra la protección
   * de rutas y el uso del decorador @GetUser().
   * @param user - Usuario obtenido del payload del token JWT.
   * @returns Datos del usuario autenticado en la sesión.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: UserDocument) {
    return {
      message: 'Acceso autorizado con JWT.',
      user,
    };
  }
}
