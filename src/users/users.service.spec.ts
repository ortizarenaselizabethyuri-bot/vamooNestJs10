import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

/**
 * Suite de pruebas unitarias para UsersService.
 *
 * Propósito: Validar que el servicio de usuarios se instancie y responda adecuadamente.
 */
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const mockUserModel = {
      new: vi.fn(),
      constructor: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      exec: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  /**
   * Verifica que el servicio esté correctamente definido.
   */
  it('debe estar definido el servicio de usuarios', () => {
    expect(service).toBeDefined();
  });
});
