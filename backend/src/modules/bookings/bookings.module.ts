import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './booking.service';
import { BookingsController } from './bookings.controller';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BusinessEntity,
      CustomerEntity,
      BusinessHoursEntity,
      PaymentEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
