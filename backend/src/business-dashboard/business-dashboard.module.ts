import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessDashboardController } from './business-dashboard.controller';
import { BusinessDashboardService } from './business-dashboard.service';
import { BusinessEntity } from '../entities/business.entity';
import { BusinessServiceEntity } from '../entities/business-service.entity';
import { BusinessHoursEntity } from '../entities/business-hours.entity';
import { BookingEntity } from '../entities/booking.entity';
import { PaymentEntity } from '../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessEntity,
      BusinessServiceEntity,
      BusinessHoursEntity,
      BookingEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [BusinessDashboardController],
  providers: [BusinessDashboardService],
  exports: [BusinessDashboardService],
})
export class BusinessDashboardModule {}
