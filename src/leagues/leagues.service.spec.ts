import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/schemas/user.schema.js';
import { LeaguesService } from './leagues.service.js';
import { LeagueGroup } from './schemas/league-group.schema.js';

/**
 * Suite de pruebas unitarias para LeaguesService.
 *
 * Propósito: Validar que el servicio de ligas se instancie correctamente con sus dependencias.
 */
describe('LeaguesService', () => {
  let service: LeaguesService;

  beforeEach(async () => {
    const mockLeagueGroupModel = {
      new: vi.fn(),
      constructor: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      exec: vi.fn(),
    };

    const mockUserModel = {
      findByIdAndUpdate: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaguesService,
        {
          provide: getModelToken(LeagueGroup.name),
          useValue: mockLeagueGroupModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<LeaguesService>(LeaguesService);
  });

  /**
   * Verifica que el servicio esté correctamente instanciado.
   */
  it('debe estar definido el servicio de ligas', () => {
    expect(service).toBeDefined();
  });
});
