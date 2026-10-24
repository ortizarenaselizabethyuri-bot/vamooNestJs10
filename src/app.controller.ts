import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

/**
 * Controlador principal de la aplicación.
 *
 * Propósito: Gestionar las peticiones HTTP entrantes a la ruta raíz y coordinar la respuesta.
 */
@Controller()
export class AppController {
  /**
   * Constructor del controlador principal.
   *
   * @param appService - Instancia inyectada del servicio AppService para lógica de negocio.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Manejador de la petición GET a la ruta base ("/").
   *
   * Propósito: Retornar el saludo inicial de bienvenida.
   * Parámetros: Ninguno.
   * Retorno: string con el mensaje de saludo.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

