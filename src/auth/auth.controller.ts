import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
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
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Inyecta la instancia del servicio de autenticación y servicio de configuración.
   *
   * @param authService - Servicio con lógica de JWT, contraseñas y OAuth.
   * @param configService - Servicio de variables de entorno para obtener URL del frontend.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Endpoint POST /auth/register
   *
   * Propósito: Registrar un nuevo usuario en la base de datos con contraseña encriptada.
   * @param registerDto - Datos de registro (name, email, password).
   * @returns Datos del usuario creado y token JWT de acceso.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una nueva cuenta local y retorna el usuario con su token JWT.',
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya se encuentra registrado.' })
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
  @ApiOperation({
    summary: 'Iniciar sesión con credenciales locales',
    description: 'Valida email y contraseña y retorna el usuario junto a su token JWT.',
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
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
  @ApiOperation({
    summary: 'Iniciar flujo de autenticación con Google OAuth 2.0',
    description: 'Redirige automáticamente a la pantalla de consentimiento de Google.',
  })
  @ApiResponse({ status: 302, description: 'Redirección a Google.' })
  async googleAuth() {
    // El GoogleAuthGuard redirige automáticamente al flujo de Google
  }

  /**
   * Endpoint GET /auth/google/callback
   *
   * Propósito: Recibir la respuesta de autorización de Google OAuth 2.0, autenticar
   * o vincular al usuario en el esquema User, generar el token JWT y redirigir
   * al frontend Angular para ingresar a la sección de juego (/jugar).
   * @param req - Request con el usuario validado en req.user por GoogleStrategy.
   * @param res - Objeto Response de Express para redirigir al frontend o emitir JSON.
   * @returns Redirección HTTP 302 hacia Angular con sesión o respuesta JSON si es cliente API.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback de Google OAuth 2.0',
    description: 'Punto de retorno tras autorizar en Google; emite o autentica con JWT y redirige a la aplicación frontend.',
  })
  @ApiResponse({ status: 302, description: 'Redirección al frontend con token y sesión.' })
  @ApiResponse({ status: 200, description: 'Autenticación con Google exitosa (formato JSON).' })
  async googleAuthCallback(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const authResult = this.authService.loginWithGoogle(req.user);
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200',
    );

    // Si la petición solicita explícitamente JSON puro (Swagger, Postman, test de API)
    if (
      req.headers?.accept?.includes('application/json') &&
      !req.headers?.accept?.includes('text/html')
    ) {
      return res.status(HttpStatus.OK).json(authResult);
    }

    // Serialización segura de los datos del usuario para el cliente Angular
    const encodedUser = encodeURIComponent(JSON.stringify(authResult.user));
    const targetUrl = `${frontendUrl}/login?token=${authResult.accessToken}&user=${encodedUser}`;

    return res.redirect(targetUrl);
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Ruta protegida que extrae y retorna los datos del token JWT en sesión.',
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado / Token JWT inválido o ausente.' })
  getProfile(@GetUser() user: UserDocument) {
    return {
      message: 'Acceso autorizado con JWT.',
      user,
    };
  }
}
