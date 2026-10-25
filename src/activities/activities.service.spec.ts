import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from '../routes/routes.service.js';
import { UsersService } from '../users/users.service.js';
import { ActivitiesService } from './activities.service.js';
import { UserActivity } from './schemas/user-activity.schema.js';

/**
 * Suite de pruebas unitarias para ActivitiesService.
 *
 * Propósito: Validar que el servicio de actividades se instancie adecuadamente con sus dependencias.
 */
describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const mockActivityModel = {
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
      addXp: vi.fn(),
    };

    const mockRoutesService = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getModelToken(UserActivity.name),
          useValue: mockActivityModel,
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

    service = module.get<ActivitiesService>(ActivitiesService);
  });

  /**
   * Verifica que el servicio esté correctamente definido.
   */
  it('debe estar definido el servicio de actividades', () => {
    expect(service).toBeDefined();
  });
});
