import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('Booking Flow Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      // Import all modules
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Booking Lifecycle', () => {
    let customerId: string;
    let businessId: string;
    let bookingId: string;
    let customerToken: string;
    let businessToken: string;

    it('should register customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'customer@test.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+61412345678',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      customerId = res.body.user.id;
      customerToken = res.body.accessToken;
    });

    it('should register business', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'business@test.com',
          password: 'Password123!',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+61487654321',
          role: 'business',
        });

      expect(res.status).toBe(201);
      businessId = res.body.user.id;
      businessToken = res.body.accessToken;
    });

    it('should create booking', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          businessId,
          customerId,
          serviceId: 'service123',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration_hours: 2,
          location: '123 Main St, Sydney NSW 2000',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      bookingId = res.body.id;
    });

    it('should accept booking', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bookings/${bookingId}/accept-authenticated`)
        .set('Authorization', `Bearer ${businessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('requires_payment');
    });

    it('should process payment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bookings/${bookingId}/payment`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentMethodId: 'pm_test_123',
          amount: 200,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('succeeded');
    });

    it('should complete booking', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${businessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('should create review', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId,
          rating: 5,
          title: 'Excellent service',
          comment: 'Very professional and thorough',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    });
  });
});

// E2E tests
