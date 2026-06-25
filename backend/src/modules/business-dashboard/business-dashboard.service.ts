import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BookingStatus } from '../bookings/booking.service';
import { PaymentEntity } from '../../common/entities/payment.entity';

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  cancellationRate: number;
}

export interface UpdateServiceDto {
  service_name: string;
  hourly_rate: number;
  description?: string;
}

export interface UpdateBusinessHoursDto {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  open_time: string; // HH:MM
  close_time: string; // HH:MM
  is_available: boolean;
}

@Injectable()
export class BusinessDashboardService {
  constructor(
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(BusinessServiceEntity)
    private serviceRepository: Repository<BusinessServiceEntity>,
    @InjectRepository(BusinessHoursEntity)
    private hoursRepository: Repository<BusinessHoursEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async getDashboardOverview(businessId: string): Promise<DashboardStats> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.bookingRepository.countBy({ business_id: businessId }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.PENDING,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.CONFIRMED,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.COMPLETED,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.CANCELLED,
      }),
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
      }),
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
        created_at: Between(monthStart, now),
      }),
    ]);

    const cancellationRate =
      totalBookings > 0
        ? (cancelledBookings / totalBookings) * 100
        : 0;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: totalRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      averageRating: business.average_rating,
      totalReviews: business.total_reviews,
      cancellationRate: Math.round(cancellationRate),
    };
  }

  async getBusinessProfile(businessId: string): Promise<BusinessEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services', 'hours', 'images', 'banking_details', 'user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async updateBusinessProfile(
    businessId: string,
    updates: Partial<BusinessEntity>,
  ): Promise<BusinessEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Only allow certain fields to be updated
    const allowedFields = [
      'name',
      'description',
      'experience',
      'qualifications',
      'licences',
      'website',
      'service_radius_km',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        business[field] = updates[field];
      }
    });

    await this.businessRepository.save(business);
    return business;
  }

  async getServices(businessId: string): Promise<BusinessServiceEntity[]> {
    return this.serviceRepository.find({
      where: { business_id: businessId },
      order: { created_at: 'ASC' },
    });
  }

  async addService(
    businessId: string,
    dto: UpdateServiceDto,
  ): Promise<BusinessServiceEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const service = this.serviceRepository.create({
      business_id: businessId,
      service_name: dto.service_name,
      hourly_rate: dto.hourly_rate,
      description: dto.description,
    });

    await this.serviceRepository.save(service);
    return service;
  }

  async updateService(
    serviceId: string,
    businessId: string,
    dto: UpdateServiceDto,
  ): Promise<BusinessServiceEntity> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, business_id: businessId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.service_name = dto.service_name;
    service.hourly_rate = dto.hourly_rate;
    service.description = dto.description;

    await this.serviceRepository.save(service);
    return service;
  }

  async deleteService(
    serviceId: string,
    businessId: string,
  ): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, business_id: businessId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if service has active bookings
    const activeBookings = await this.bookingRepository.findOne({
      where: {
        service_id: serviceId,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (activeBookings) {
      throw new BadRequestException(
        'Cannot delete service with active bookings',
      );
    }

    await this.serviceRepository.delete(serviceId);
  }

  async getBusinessHours(businessId: string): Promise<BusinessHoursEntity[]> {
    return this.hoursRepository.find({
      where: { business_id: businessId },
      order: { day_of_week: 'ASC' },
    });
  }

  async updateBusinessHours(
    businessId: string,
    dto: UpdateBusinessHoursDto,
  ): Promise<BusinessHoursEntity> {
    let hours = await this.hoursRepository.findOne({
      where: {
        business_id: businessId,
        day_of_week: dto.day_of_week,
      },
    });

    if (!hours) {
      hours = this.hoursRepository.create({
        business_id: businessId,
        day_of_week: dto.day_of_week,
      });
    }

    hours.open_time = dto.open_time;
    hours.close_time = dto.close_time;
    hours.is_available = dto.is_available;

    await this.hoursRepository.save(hours);
    return hours;
  }

  async getRecentBookings(
    businessId: string,
    limit = 10,
  ): Promise<BookingEntity[]> {
    return this.bookingRepository.find({
      where: { business_id: businessId },
      relations: ['customer', 'service'],
      order: { scheduled_date: 'DESC' },
      take: limit,
    });
  }

  async getRevenueStats(businessId: string): Promise<{
    lastWeek: number;
    lastMonth: number;
    lastQuarter: number;
    allTime: number;
  }> {
    const now = new Date();

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [lastWeek, lastMonth, lastQuarter, allTime] = await Promise.all([
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
        created_at: Between(weekAgo, now),
      }),
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
        created_at: Between(monthAgo, now),
      }),
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
        created_at: Between(quarterAgo, now),
      }),
      this.paymentRepository.sum('payout_amount', {
        business_id: businessId,
        status: 'succeeded',
      }),
    ]);

    return {
      lastWeek: lastWeek || 0,
      lastMonth: lastMonth || 0,
      lastQuarter: lastQuarter || 0,
      allTime: allTime || 0,
    };
  }

  async getBookingStats(businessId: string): Promise<{
    byStatus: {
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
    byDay: Record<string, number>;
  }> {
    const bookings = await this.bookingRepository.find({
      where: { business_id: businessId },
    });

    const byStatus = {
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
        .length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED)
        .length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED)
        .length,
      noShow: bookings.filter((b) => b.status === BookingStatus.NO_SHOW).length,
    };

    const byDay: Record<string, number> = {};
    bookings.forEach((b) => {
      const day = new Date(b.scheduled_date).toLocaleDateString('en-AU');
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return { byStatus, byDay };
  }
}
