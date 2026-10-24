import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

/**
 * Suite de pruebas unitarias para AppController.
 *
 * Propósito: Validar el correcto funcionamiento del controlador principal y su interacción con AppService.
 */
describe('AppController', () => {
  let appController: AppController;

  /**
   * Configuración previa a cada prueba.
   * Inicializa el módulo de testing e inyecta la instancia de AppController.
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    /**
     * Prueba el endpoint raíz para confirmar que retorna el saludo esperado.
     */
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

