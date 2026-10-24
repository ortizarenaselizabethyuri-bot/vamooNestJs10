import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';

/**
 * Interfaz que define la estructura del payload decodificado del JWT.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

/**
 * Estrategia de Passport para validar tokens JWT en peticiones protegidas.
 *
 * Propósito: Extraer el token Bearer del header Authorization, verificar la firma
 * con la clave secreta y cargar la entidad User en la petición (req.user).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Configura la estrategia con la clave secreta y la regla de extracción de token.
   *
   * @param configService - Servicio para obtener la variable de entorno JWT_SECRET.
   * @param usersService - Servicio para consultar y validar la existencia del usuario.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'super-secret-default-key-change-in-env',
      ),
    });
  }

  /**
   * Valida el payload una vez decodificado y firmado por el middleware de Passport.
   *
   * Propósito: Verificar que el usuario continúe existiendo y activo en la base de datos.
   * @param payload - Objeto con los datos incluidos dentro del token JWT.
   * @returns Promise<any> Información del usuario autenticado que se asignará a req.user.
   * @throws UnauthorizedException Si el usuario no existe o se encuentra inactivo.
   */
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'El usuario no existe o se encuentra deshabilitado.',
      );
    }

    return user;
  }
}
