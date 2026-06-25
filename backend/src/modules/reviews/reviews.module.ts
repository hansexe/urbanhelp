import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './review.service';
import { ReviewsController } from './reviews.controller';
import { ReviewEntity } from '../../common/entities/review.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { CommonModule } from '../../common/common.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, BookingEntity, BusinessEntity]),
    CommonModule,
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
