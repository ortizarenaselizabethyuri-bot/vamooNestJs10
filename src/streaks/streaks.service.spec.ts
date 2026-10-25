import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service.js';
import { Streak } from './schemas/streak.schema.js';
import { StreaksService } from './streaks.service.js';

/**
 * Suite de pruebas unitarias para StreaksService.
 *
 * Propósito: Validar que el servicio de rachas se instancie correctamente con sus dependencias.
 */
describe('StreaksService', () => {
  let service: StreaksService;

  beforeEach(async () => {
    const mockStreakModel = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreaksService,
        {
          provide: getModelToken(Streak.name),
          useValue: mockStreakModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<StreaksService>(StreaksService);
  });

  /**
   * Verifica que el servicio esté correctamente instanciado.
   */
  it('debe estar definido el servicio de rachas', () => {
    expect(service).toBeDefined();
  });
});
