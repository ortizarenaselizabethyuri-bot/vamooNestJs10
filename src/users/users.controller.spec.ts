import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

/**
 * Suite de pruebas unitarias para UsersController.
 *
 * Propósito: Validar que el controlador de usuarios se instancie y responda a las peticiones.
 */
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const mockUsersService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  /**
   * Verifica que el controlador esté correctamente definido.
   */
  it('debe estar definido el controlador de usuarios', () => {
    expect(controller).toBeDefined();
  });
});
