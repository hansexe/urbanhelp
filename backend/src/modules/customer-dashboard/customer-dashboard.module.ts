import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDashboardService } from './customer-dashboard.service';
import { CustomerDashboardController } from './customer-dashboard.controller';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { ReviewEntity } from '../../common/entities/review.entity';

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
