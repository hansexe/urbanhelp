import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDashboardService } from './customer-dashboard.service';
import { CustomerDashboardController } from './customer-dashboard.controller';
import { CustomerEntity } from '../entities/customer.entity';
import { BookingEntity } from '../entities/booking.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { ReviewEntity } from '../entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      BookingEntity,
      PaymentEntity,
      ReviewEntity,
    ]),
  ],
  controllers: [CustomerDashboardController],
  providers: [CustomerDashboardService],
  exports: [CustomerDashboardService],
})
export class CustomerDashboardModule {}
