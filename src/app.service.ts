import { Injectable } from '@nestjs/common';

/**
 * Servicio principal de la aplicación.
 *
 * Propósito: Proveer la lógica de negocio y datos para el AppController.
 */
@Injectable()
export class AppService {
  /**
   * Genera el mensaje de bienvenida de la aplicación.
   *
   * Propósito: Devolver un mensaje simple de saludo para verificar el estado de la API.
   * Parámetros: Ninguno.
   * Retorno: string con el texto "Hello World!".
   */
  getHello(): string {
    return 'Hello World!';
  }
}

