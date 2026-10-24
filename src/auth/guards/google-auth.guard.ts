import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para iniciar y procesar el flujo de autenticación OAuth 2.0 con Google.
 *
 * Propósito: Redirigir al usuario al consentimiento de Google y autenticar el callback retornado.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
