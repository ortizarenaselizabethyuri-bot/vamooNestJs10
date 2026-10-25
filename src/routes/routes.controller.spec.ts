import { Test, TestingModule } from '@nestjs/testing';
import { RoutesController } from './routes.controller.js';
import { RoutesService } from './routes.service.js';

/**
 * Suite de pruebas unitarias para RoutesController.
 *
 * Propósito: Validar la correcta instanciación del controlador de rutas.
 */
describe('RoutesController', () => {
  let controller: RoutesController;

  beforeEach(async () => {
    const mockRoutesService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findNearby: vi.fn(),
      findByQrCode: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [
        {
          provide: RoutesService,
          useValue: mockRoutesService,
        },
      ],
    }).compile();

    controller = module.get<RoutesController>(RoutesController);
  });

  /**
   * Verifica que el controlador esté correctamente instanciado.
   */
  it('debe estar definido el controlador de rutas', () => {
    expect(controller).toBeDefined();
  });
});
