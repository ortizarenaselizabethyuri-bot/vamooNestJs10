import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from '../routes/routes.service.js';
import { UsersService } from '../users/users.service.js';
import { AchievementsService } from './achievements.service.js';
import { Achievement } from './schemas/achievement.schema.js';

/**
 * Suite de pruebas unitarias para AchievementsService.
 *
 * Propósito: Validar que el servicio de condecoraciones se instancie adecuadamente con sus dependencias.
 */
describe('AchievementsService', () => {
  let service: AchievementsService;

  beforeEach(async () => {
    const mockAchievementModel = {
      new: vi.fn(),
      constructor: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      exec: vi.fn(),
    };

    const mockUsersService = {
      findById: vi.fn(),
    };

    const mockRoutesService = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        {
          provide: getModelToken(Achievement.name),
          useValue: mockAchievementModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RoutesService,
          useValue: mockRoutesService,
        },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  /**
   * Verifica que el servicio esté correctamente definido.
   */
  it('debe estar definido el servicio de logros', () => {
    expect(service).toBeDefined();
  });
});
