import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      // Import all modules
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoint', async () => {
      for (let i = 0; i < 6; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrong',
          });

        if (i < 5) {
          expect([400, 401]).toContain(res.status);
        } else {
          expect(res.status).toBe(429); // Too many requests
        }
      }
    });
  });

  describe('CORS and Security Headers', () => {
    it('should have proper security headers', async () => {
      const res = await request(app.getHttpServer()).get('/');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
