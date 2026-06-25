import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { BookingEntity } from '../entities/booking.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { ReviewEntity } from '../entities/review.entity';

export interface CustomerStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageRating: number;
  totalReviewsGiven: number;
  savingsFromRefunds: number;
}

export interface CustomerPreferences {
  notificationsEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  preferredPaymentMethod: string;
  savedAddresses: string[];
}

@Injectable()
export class CustomerDashboardService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
  ) {}

  async getDashboardOverview(customerId: string): Promise<CustomerStats> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalSpent,
      totalRefunded,
      totalReviews,
    ] = await Promise.all([
      this.bookingRepository.countBy({ customer_id: customerId }),
      this.bookingRepository.countBy({
        customer_id: customerId,
        scheduled_date: Between(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
        status: 'confirmed',
      }),
      this.bookingRepository.countBy({
        customer_id: customerId,
        status: 'completed',
      }),
      this.paymentRepository.sum('amount', {
        customer_id: customerId,
        payment_type: 'booking',
        status: 'succeeded',
      }),
      this.paymentRepository.sum('amount', {
        customer_id: customerId,
        payment_type: 'refund',
        status: 'succeeded',
      }),
      this.reviewRepository.countBy({ customer_id: customerId }),
    ]);

    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalSpent: totalSpent || 0,
      averageRating: customer.average_rating || 0,
      totalReviewsGiven: totalReviews,
      savingsFromRefunds: totalRefunded || 0,
    };
  }

  async getUpcomingBookings(customerId: string, limit = 5): Promise<BookingEntity[]> {
    const now = new Date();
    return this.bookingRepository.find({
      where: {
        customer_id: customerId,
        scheduled_date: Between(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
        status: 'confirmed',
      },
      relations: ['business', 'service'],
      order: { scheduled_date: 'ASC' },
      take: limit,
    });
  }

  async getBookingHistory(customerId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.find({
      where: { customer_id: customerId },
      relations: ['business', 'service'],
      order: { created_at: 'DESC' },
    });
  }

  async getPaymentHistory(customerId: string): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { customer_id: customerId },
      order: { created_at: 'DESC' },
    });
  }

  async getReviewHistory(customerId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { customer_id: customerId },
      relations: ['business'],
      order: { created_at: 'DESC' },
    });
  }

  async getFavoriteBusinesses(customerId: string): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      where: { customer_id: customerId, status: 'completed' },
      relations: ['business'],
    });

    const businessCounts = new Map();
    bookings.forEach((booking) => {
      const count = businessCounts.get(booking.business_id) || 0;
      businessCounts.set(booking.business_id, count + 1);
    });

    // Get top 5 businesses
    const sortedBusinesses = Array.from(businessCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedBusinesses.map(([businessId, count]) => ({
      businessId,
      bookingCount: count,
    }));
  }

  async saveAddress(customerId: string, address: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const savedAddresses = customer.saved_addresses || [];
    if (!savedAddresses.includes(address)) {
      savedAddresses.push(address);
      await this.customerRepository.update(
        { id: customerId },
        { saved_addresses: savedAddresses },
      );
    }
  }

  async getSavedAddresses(customerId: string): Promise<string[]> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer.saved_addresses || [];
  }

  async deleteAddress(customerId: string, address: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const savedAddresses = (customer.saved_addresses || []).filter(
      (a) => a !== address,
    );
    await this.customerRepository.update(
      { id: customerId },
      { saved_addresses: savedAddresses },
    );
  }

  async updatePreferences(
    customerId: string,
    preferences: Partial<CustomerPreferences>,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updates: any = {};
    if (preferences.notificationsEnabled !== undefined) {
      updates.notifications_enabled = preferences.notificationsEnabled;
    }
    if (preferences.smsNotifications !== undefined) {
      updates.sms_notifications = preferences.smsNotifications;
    }
    if (preferences.emailNotifications !== undefined) {
      updates.email_notifications = preferences.emailNotifications;
    }
    if (preferences.preferredPaymentMethod !== undefined) {
      updates.preferred_payment_method = preferences.preferredPaymentMethod;
    }

    await this.customerRepository.update({ id: customerId }, updates);
  }

  async getMonthlySpending(customerId: string): Promise<{
    [month: string]: number;
  }> {
    const payments = await this.paymentRepository.find({
      where: {
        customer_id: customerId,
        payment_type: 'booking',
        status: 'succeeded',
      },
    });

    const monthlySpending: { [key: string]: number } = {};

    payments.forEach((payment) => {
      const date = new Date(payment.created_at);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + payment.amount;
    });

    return monthlySpending;
  }

  async getAverageRating(customerId: string): Promise<number> {
    const reviews = await this.reviewRepository.find({
      where: { customer_id: customerId },
    });

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
  }
}
