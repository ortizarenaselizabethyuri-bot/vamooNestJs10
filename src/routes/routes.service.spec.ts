import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service.js';
import { Route } from './schemas/route.schema.js';

/**
 * Suite de pruebas unitarias para RoutesService.
 *
 * Propósito: Validar la correcta instanciación del servicio de rutas con Mongoose.
 */
describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(async () => {
    const mockRouteModel = {
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
        RoutesService,
        {
          provide: getModelToken(Route.name),
          useValue: mockRouteModel,
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  /**
   * Verifica que el servicio esté correctamente instanciado.
   */
  it('debe estar definido el servicio de rutas', () => {
    expect(service).toBeDefined();
  });
});
