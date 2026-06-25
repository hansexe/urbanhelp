// backend/src/__tests__/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('token'),
      verify: jest.fn().mockReturnValue({ sub: '123', email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+61412345678',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashed_password',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '123',
        ...registerDto,
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+61412345678',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '123' });

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'customer',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.login('test@example.com', 'Password123!');

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw error on invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'WrongPassword'),
      ).rejects.toThrow();
    });
  });
});

// backend/src/__tests__/bookings.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookingsService } from '../bookings/booking.service';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { CustomerEntity } from '../entities/customer.entity';

describe('BookingsService', () => {
  let service: BookingsService;
  let mockBookingRepository: any;
  let mockBusinessRepository: any;
  let mockCustomerRepository: any;

  beforeEach(async () => {
    mockBookingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      countBy: jest.fn(),
    };

    mockBusinessRepository = {
      findOne: jest.fn(),
    };

    mockCustomerRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(BookingEntity),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(BusinessEntity),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const createBookingDto = {
        businessId: 'business123',
        customerId: 'customer123',
        serviceId: 'service123',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration_hours: 2,
        location: '123 Main St, Sydney NSW 2000',
      };

      mockBusinessRepository.findOne.mockResolvedValue({
        id: 'business123',
        approval_status: 'approved',
        services: [{ id: 'service123', hourly_rate: 100 }],
        user: {},
      });

      mockCustomerRepository.findOne.mockResolvedValue({
        id: 'customer123',
        user: {},
      });

      mockBookingRepository.findOne.mockResolvedValue(null);
      mockBookingRepository.create.mockReturnValue({
        ...createBookingDto,
        status: 'pending',
        total_amount: 200,
      });
      mockBookingRepository.save.mockResolvedValue({
        id: 'booking123',
        ...createBookingDto,
      });

      const result = await service.createBooking(createBookingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('booking123');
      expect(mockBookingRepository.create).toHaveBeenCalled();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should prevent double-booking', async () => {
      const createBookingDto = {
        businessId: 'business123',
        customerId: 'customer123',
        serviceId: 'service123',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration_hours: 2,
        location: '123 Main St, Sydney NSW 2000',
      };

      mockBusinessRepository.findOne.mockResolvedValue({
        id: 'business123',
        approval_status: 'approved',
        services: [{ id: 'service123' }],
        user: {},
      });

      mockCustomerRepository.findOne.mockResolvedValue({
        id: 'customer123',
        user: {},
      });

      // Simulate existing booking at same time
      mockBookingRepository.findOne.mockResolvedValue({
        id: 'existing123',
        status: 'confirmed',
      });

      await expect(service.createBooking(createBookingDto)).rejects.toThrow();
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking with full refund if > 24 hours', async () => {
      const booking = {
        id: 'booking123',
        customer_id: 'customer123',
        business_id: 'business123',
        scheduled_date: new Date(Date.now() + 25 * 60 * 60 * 1000),
        total_amount: 200,
        status: 'confirmed',
        customer: { user: {} },
        business: { name: 'Test Business' },
      };

      mockBookingRepository.findOne.mockResolvedValue(booking);
      mockBookingRepository.save.mockResolvedValue({
        ...booking,
        status: 'cancelled',
        refund_amount: 200,
      });

      const result = await service.cancelBooking(
        'booking123',
        'customer123',
        { reason: 'Test cancellation' },
        'customer',
      );

      expect(result.refund_amount).toBe(200);
    });

    it('should cancel booking with 50% refund if < 24 hours', async () => {
      const booking = {
        id: 'booking123',
        customer_id: 'customer123',
        business_id: 'business123',
        scheduled_date: new Date(Date.now() + 12 * 60 * 60 * 1000),
        total_amount: 200,
        status: 'confirmed',
        customer: { user: {} },
        business: { name: 'Test Business' },
      };

      mockBookingRepository.findOne.mockResolvedValue(booking);
      mockBookingRepository.save.mockResolvedValue({
        ...booking,
        status: 'cancelled',
        refund_amount: 100,
      });

      const result = await service.cancelBooking(
        'booking123',
        'customer123',
        { reason: 'Test cancellation' },
        'customer',
      );

      expect(result.refund_amount).toBe(100);
    });
  });
});

// backend/src/__tests__/reviews.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from '../reviews/review.service';
import { ReviewEntity } from '../entities/review.entity';
import { BookingEntity } from '../entities/booking.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let mockReviewRepository: any;
  let mockBookingRepository: any;

  beforeEach(async () => {
    mockReviewRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockBookingRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(ReviewEntity),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(BookingEntity),
          useValue: mockBookingRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('createReview', () => {
    it('should create a review on completed booking', async () => {
      const createReviewDto = {
        bookingId: 'booking123',
        rating: 5,
        title: 'Great service',
        comment: 'Highly recommend',
      };

      mockBookingRepository.findOne.mockResolvedValue({
        id: 'booking123',
        customer_id: 'customer123',
        business_id: 'business123',
        status: 'completed',
        business: { user: { email: 'biz@example.com' } },
      });

      mockReviewRepository.findOne.mockResolvedValue(null);
      mockReviewRepository.create.mockReturnValue(createReviewDto);
      mockReviewRepository.save.mockResolvedValue({
        id: 'review123',
        ...createReviewDto,
      });

      const result = await service.createReview('customer123', createReviewDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('review123');
      expect(result.rating).toBe(5);
    });

    it('should prevent duplicate reviews', async () => {
      const createReviewDto = {
        bookingId: 'booking123',
        rating: 5,
        title: 'Great service',
        comment: 'Highly recommend',
      };

      mockBookingRepository.findOne.mockResolvedValue({
        id: 'booking123',
        status: 'completed',
      });

      // Review already exists
      mockReviewRepository.findOne.mockResolvedValue({
        id: 'review123',
      });

      await expect(service.createReview('customer123', createReviewDto)).rejects.toThrow();
    });

    it('should validate rating between 1-5', async () => {
      const createReviewDto = {
        bookingId: 'booking123',
        rating: 10, // Invalid
        title: 'Great service',
        comment: 'Highly recommend',
      };

      mockBookingRepository.findOne.mockResolvedValue({
        id: 'booking123',
        status: 'completed',
      });

      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.createReview('customer123', createReviewDto)).rejects.toThrow();
    });
  });
});

// Integration tests
// backend/src/__tests__/integration/booking-flow.integration.spec.ts
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
// backend/src/__tests__/e2e/api.e2e.spec.ts
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
