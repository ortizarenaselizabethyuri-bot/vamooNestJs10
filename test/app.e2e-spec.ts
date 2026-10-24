import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

/**
 * Suite de pruebas End-to-End (e2e) para la aplicación NestJS.
 *
 * Propósito: Validar el flujo completo de peticiones HTTP en una instancia real de la aplicación.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  /**
   * Inicializa la aplicación antes de cada prueba e2e.
   */
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * Prueba de integración HTTP GET a la raíz ('/').
   */
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  /**
   * Cierra la aplicación liberando puertos y conexiones después de cada prueba.
   */
  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});


