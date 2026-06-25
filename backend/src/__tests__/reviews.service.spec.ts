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
