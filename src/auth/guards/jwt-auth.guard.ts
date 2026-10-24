import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rutas que requieren autenticación mediante JSON Web Token (JWT).
 *
 * Propósito: Interceptar peticiones y verificar la validez del token Bearer antes
 * de permitir el acceso a los controladores o endpoints protegidos.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
