import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service.js';

/**
 * Estrategia de Passport para la autenticación OAuth 2.0 con Google.
 *
 * Propósito: Gestionar la redirección, recepción del código de autorización,
 * intercambio por perfil de Google y vinculación o creación del usuario en MongoDB.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  /**
   * Configura las credenciales de Google OAuth 2.0.
   *
   * @param configService - Servicio para obtener GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_CALLBACK_URL.
   * @param usersService - Servicio de usuarios para guardar o consultar el usuario de Google.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', 'dummy_google_client_id'),
      clientSecret: configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
        'dummy_google_client_secret',
      ),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Procesa y valida el perfil de Google retornado tras la autorización.
   *
   * Propósito: Extraer email, nombre, foto y googleId, y persistir/recuperar al usuario mediante UsersService.
   * @param accessToken - Token de acceso emitido por Google.
   * @param refreshToken - Token de refresco emitido por Google (si aplica).
   * @param profile - Perfil público retornado por los servidores de Google.
   * @param done - Callback de finalización de Passport.
   * @returns Promise<any> Documento del usuario sincronizado.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email = emails && emails.length > 0 ? emails[0].value : null;
    const picture = photos && photos.length > 0 ? photos[0].value : undefined;
    const fullName =
      name && (name.givenName || name.familyName)
        ? `${name.givenName || ''} ${name.familyName || ''}`.trim()
        : profile.displayName || 'Google User';

    if (!email) {
      return done(new Error('No se pudo obtener el correo de la cuenta de Google.'), false);
    }

    const user = await this.usersService.findOrCreateGoogleUser({
      googleId: id,
      email,
      name: fullName,
      picture,
    });

    return done(null, user);
  }
}
