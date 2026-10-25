import { Test, TestingModule } from '@nestjs/testing';
import { StreaksController } from './streaks.controller.js';
import { StreaksService } from './streaks.service.js';

/**
 * Suite de pruebas unitarias para StreaksController.
 *
 * Propósito: Validar que el controlador de rachas esté correctamente instanciado.
 */
describe('StreaksController', () => {
  let controller: StreaksController;

  beforeEach(async () => {
    const mockStreaksService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      recordValidOuting: vi.fn(),
      freezeStreak: vi.fn(),
      unfreezeStreak: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreaksController],
      providers: [
        {
          provide: StreaksService,
          useValue: mockStreaksService,
        },
      ],
    }).compile();

    controller = module.get<StreaksController>(StreaksController);
  });

  /**
   * Verifica que el controlador esté correctamente instanciado.
   */
  it('debe estar definido el controlador de rachas', () => {
    expect(controller).toBeDefined();
  });
});
