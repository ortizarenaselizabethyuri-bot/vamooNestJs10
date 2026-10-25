import { Test, TestingModule } from '@nestjs/testing';
import { LeaguesController } from './leagues.controller.js';
import { LeaguesService } from './leagues.service.js';

/**
 * Suite de pruebas unitarias para LeaguesController.
 *
 * Propósito: Validar que el controlador de ligas se instancie correctamente.
 */
describe('LeaguesController', () => {
  let controller: LeaguesController;

  beforeEach(async () => {
    const mockLeaguesService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findUserActiveGroup: vi.fn(),
      getLeaderboard: vi.fn(),
      assignUserToAvailableGroup: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaguesController],
      providers: [
        {
          provide: LeaguesService,
          useValue: mockLeaguesService,
        },
      ],
    }).compile();

    controller = module.get<LeaguesController>(LeaguesController);
  });

  /**
   * Verifica que el controlador esté correctamente instanciado.
   */
  it('debe estar definido el controlador de ligas', () => {
    expect(controller).toBeDefined();
  });
});
