import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';

/**
 * Suite de pruebas unitarias para ActivitiesController.
 *
 * Propósito: Validar que el controlador de actividades esté correctamente instanciado.
 */
describe('ActivitiesController', () => {
  let controller: ActivitiesController;

  beforeEach(async () => {
    const mockActivitiesService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      getUserStats: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
  });

  /**
   * Verifica que el controlador esté correctamente definido.
   */
  it('debe estar definido el controlador de actividades', () => {
    expect(controller).toBeDefined();
  });
});
