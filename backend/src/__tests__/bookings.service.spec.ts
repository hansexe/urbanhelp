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
