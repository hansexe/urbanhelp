import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './booking.service';
import { BookingsController } from './bookings.controller';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BusinessEntity,
      CustomerEntity,
      PaymentEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
