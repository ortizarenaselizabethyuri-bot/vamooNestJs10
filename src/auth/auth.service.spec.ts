import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

/**
 * Suite de pruebas unitarias para AuthService.
 *
 * Propósito: Validar que el servicio de autenticación se instancie adecuadamente con sus dependencias mockeadas.
 */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findOrCreateGoogleUser: vi.fn(),
      create: vi.fn(),
    };

    const mockJwtService = {
      sign: vi.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  /**
   * Verifica que el servicio esté correctamente instanciado.
   */
  it('debe estar definido el servicio de autenticación', () => {
    expect(service).toBeDefined();
  });
});
