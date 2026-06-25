import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessDashboardController } from './business-dashboard.controller';
import { BusinessDashboardService } from './business-dashboard.service';
import { BusinessEntity } from '../../common/entities/business.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';

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
