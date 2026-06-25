import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { BusinessApprovalService } from '../businesses/business-approval.service';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessEntity, UserEntity]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [BusinessApprovalService],
  exports: [BusinessApprovalService],
})
export class AdminModule {}

// Update AppModule to include AdminModule and export BusinessApprovalService
