import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../../common/entities/business-banking-details.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { ABNValidationService } from './abn-validation.service';
import { BusinessApprovalService } from './business-approval.service';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessEntity,
      UserEntity,
      BusinessServiceEntity,
      BusinessHoursEntity,
      BusinessImageEntity,
      BusinessBankingDetailsEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService, ABNValidationService, BusinessApprovalService],
  exports: [BusinessesService, BusinessApprovalService],
})
export class BusinessesModule {}
