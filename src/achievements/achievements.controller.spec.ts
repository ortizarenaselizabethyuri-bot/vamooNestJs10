import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsController } from './achievements.controller.js';
import { AchievementsService } from './achievements.service.js';

/**
 * Suite de pruebas unitarias para AchievementsController.
 *
 * Propósito: Validar que el controlador de condecoraciones esté correctamente instanciado.
 */
describe('AchievementsController', () => {
  let controller: AchievementsController;

  beforeEach(async () => {
    const mockAchievementsService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findByUser: vi.fn(),
      awardBadgeForRoute: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementsController],
      providers: [
        {
          provide: AchievementsService,
          useValue: mockAchievementsService,
        },
      ],
    }).compile();

    controller = module.get<AchievementsController>(AchievementsController);
  });

  /**
   * Verifica que el controlador esté correctamente definido.
   */
  it('debe estar definido el controlador de logros', () => {
    expect(controller).toBeDefined();
  });
});
