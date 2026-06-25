// backend/src/businesses/abn-validation.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface ABNRecord {
  acn: string;
  abn: string;
  entityType: string;
  entityName: string;
  businessName: string;
  state: string;
  lastUpdated: string;
  isActive: boolean;
}

@Injectable()
export class ABNValidationService {
  private readonly ABN_LOOKUP_URL = 'https://api.asic.gov.au/file/abn-search-api';

  async validateABN(abn: string): Promise<ABNRecord | null> {
    const cleanedABN = abn.replace(/\s/g, '');

    if (!this.isValidABNFormat(cleanedABN)) {
      return null;
    }

    try {
      const response = await axios.get(
        `${this.ABN_LOOKUP_URL}?abn=${cleanedABN}&format=json`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'Urban-Help/1.0',
          },
        },
      );

      if (response.data && response.data.abns && response.data.abns.length > 0) {
        const record = response.data.abns[0];
        return {
          acn: record.acn || '',
          abn: record.abn,
          entityType: record.entityType,
          entityName: record.entityName,
          businessName: record.businessName,
          state: record.state,
          lastUpdated: record.lastUpdated,
          isActive: record.status === 'Active',
        };
      }

      return null;
    } catch (error) {
      console.error('ABN validation error:', error);
      return null;
    }
  }

  private isValidABNFormat(abn: string): boolean {
    if (!/^\d{11}$/.test(abn)) {
      return false;
    }

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('').map(Number);
    const adjustedFirstDigit = digits[0] - 1;

    let sum = adjustedFirstDigit * weights[0];
    for (let i = 1; i < 11; i++) {
      sum += digits[i] * weights[i];
    }

    return sum % 89 === 0;
  }
}

// backend/src/businesses/businesses.service.ts
import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BusinessEntity } from '../common/entities/business.entity';
import { UserEntity } from '../common/entities/user.entity';
import { BusinessServiceEntity } from '../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../common/entities/business-banking-details.entity';
import { ABNValidationService } from './abn-validation.service';
import { SendGridService } from '../notifications/sendgrid.service';
import { TwilioService } from '../notifications/twilio.service';

interface BusinessRegistrationDto {
  businessName: string;
  abn: string;
  ownerName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  suburb: string;
  postcode: string;
  state: string;
  serviceRadius: number;
  websiteUrl?: string;
  description: string;
  experience: string;
  qualifications: string;
  licences: string;
  services: Array<{
    serviceType: string;
    businessHoursFee: number;
    outOfHoursFee: number;
  }>;
  businessHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  accountName: string;
  bsb: string;
  accountNumber: string;
  password: string;
}

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(BusinessEntity)
    private businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(BusinessServiceEntity)
    private businessServicesRepository: Repository<BusinessServiceEntity>,
    @InjectRepository(BusinessHoursEntity)
    private businessHoursRepository: Repository<BusinessHoursEntity>,
    @InjectRepository(BusinessImageEntity)
    private businessImagesRepository: Repository<BusinessImageEntity>,
    @InjectRepository(BusinessBankingDetailsEntity)
    private bankingDetailsRepository: Repository<BusinessBankingDetailsEntity>,
    private abnValidationService: ABNValidationService,
    private sendGridService: SendGridService,
    private twilioService: TwilioService,
  ) {}

  async registerBusiness(dto: BusinessRegistrationDto) {
    const abn = dto.abn.replace(/\s/g, '');

    const existingBusiness = await this.businessesRepository.findOne({
      where: { abn },
    });

    if (existingBusiness) {
      throw new ConflictException('Business with this ABN already registered');
    }

    const existingEmail = await this.usersRepository.findOne({
      where: { email: dto.businessEmail },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const abnRecord = await this.abnValidationService.validateABN(abn);

    if (!abnRecord || !abnRecord.isActive) {
      throw new BadRequestException('ABN is invalid or not active');
    }

    if (!this.isBSBValid(dto.bsb)) {
      throw new BadRequestException('Invalid BSB number');
    }

    if (!this.isAccountNumberValid(dto.accountNumber)) {
      throw new BadRequestException('Invalid account number');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      email: dto.businessEmail,
      mobile: dto.businessMobile,
      password_hash: passwordHash,
      first_name: dto.ownerName.split(' ')[0],
      last_name: dto.ownerName.split(' ').slice(1).join(' '),
      role: 'business',
      is_verified: false,
    });

    const savedUser = await this.usersRepository.save(user);

    const business = this.businessesRepository.create({
      id: savedUser.id,
      name: dto.businessName,
      abn: abn,
      owner_name: dto.ownerName,
      business_email: dto.businessEmail,
      business_mobile: dto.businessMobile,
      business_address: dto.businessAddress,
      suburb: dto.suburb,
      postcode: dto.postcode,
      state: dto.state,
      service_radius: dto.serviceRadius,
      website_url: dto.websiteUrl,
      description: dto.description,
      experience: dto.experience,
      qualifications: dto.qualifications,
      licences: dto.licences,
      approval_status: 'pending',
      is_verified: false,
      is_approved: false,
    });

    await this.businessesRepository.save(business);

    for (const service of dto.services) {
      const businessService = this.businessServicesRepository.create({
        business_id: savedUser.id,
        service_type: service.serviceType,
        business_hours_fee: service.businessHoursFee,
        out_of_hours_fee: service.outOfHoursFee,
      });

      await this.businessServicesRepository.save(businessService);
    }

    for (const hours of dto.businessHours) {
      const businessHours = this.businessHoursRepository.create({
        business_id: savedUser.id,
        day_of_week: hours.dayOfWeek,
        start_time: hours.startTime,
        end_time: hours.endTime,
      });

      await this.businessHoursRepository.save(businessHours);
    }

    const bankingDetails = this.bankingDetailsRepository.create({
      business_id: savedUser.id,
      account_name: dto.accountName,
      bsb: dto.bsb,
      account_number: dto.accountNumber,
    });

    await this.bankingDetailsRepository.save(bankingDetails);

    await this.sendGridService.sendBusinessRegistrationEmail(dto.businessEmail, dto.businessName);
    await this.twilioService.sendBusinessRegistrationSMS(dto.businessMobile, dto.businessName);

    return {
      businessId: savedUser.id,
      status: 'pending_approval',
      message: 'Business registered successfully. Awaiting approval from Urban Help team.',
    };
  }

  async getBusinessProfile(businessId: string) {
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const services = await this.businessServicesRepository.find({
      where: { business_id: businessId },
    });

    const hours = await this.businessHoursRepository.find({
      where: { business_id: businessId },
    });

    const images = await this.businessImagesRepository.find({
      where: { business_id: businessId },
      order: { display_order: 'ASC' },
    });

    const bankingDetails = await this.bankingDetailsRepository.findOne({
      where: { business_id: businessId },
    });

    return {
      id: business.id,
      name: business.name,
      abn: business.abn,
      ownerName: business.owner_name,
      businessEmail: business.business_email,
      businessMobile: business.business_mobile,
      businessAddress: business.business_address,
      suburb: business.suburb,
      postcode: business.postcode,
      state: business.state,
      serviceRadius: business.service_radius,
      websiteUrl: business.website_url,
      description: business.description,
      experience: business.experience,
      qualifications: business.qualifications,
      licences: business.licences,
      avgRating: business.avg_rating,
      totalReviews: business.total_reviews,
      isVerified: business.is_verified,
      isApproved: business.is_approved,
      approvalStatus: business.approval_status,
      isSuspended: business.is_suspended,
      services: services.map(s => ({
        serviceType: s.service_type,
        businessHoursFee: s.business_hours_fee,
        outOfHoursFee: s.out_of_hours_fee,
      })),
      businessHours: hours.map(h => ({
        dayOfWeek: h.day_of_week,
        startTime: h.start_time,
        endTime: h.end_time,
      })),
      images: images.map(i => ({
        id: i.id,
        url: i.image_url,
        isPrimary: i.is_primary,
      })),
      bankingDetailsConfigured: !!bankingDetails && !!bankingDetails.stripe_connect_account_id,
    };
  }

  async updateBusinessProfile(businessId: string, updates: Partial<BusinessRegistrationDto>) {
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (updates.businessName) business.name = updates.businessName;
    if (updates.description) business.description = updates.description;
    if (updates.experience) business.experience = updates.experience;
    if (updates.qualifications) business.qualifications = updates.qualifications;
    if (updates.licences) business.licences = updates.licences;
    if (updates.websiteUrl) business.website_url = updates.websiteUrl;
    if (updates.serviceRadius) business.service_radius = updates.serviceRadius;

    business.updated_at = new Date();

    await this.businessesRepository.save(business);

    if (updates.services && updates.services.length > 0) {
      await this.businessServicesRepository.delete({ business_id: businessId });

      for (const service of updates.services) {
        const businessService = this.businessServicesRepository.create({
          business_id: businessId,
          service_type: service.serviceType,
          business_hours_fee: service.businessHoursFee,
          out_of_hours_fee: service.outOfHoursFee,
        });

        await this.businessServicesRepository.save(businessService);
      }
    }

    if (updates.businessHours && updates.businessHours.length > 0) {
      await this.businessHoursRepository.delete({ business_id: businessId });

      for (const hours of updates.businessHours) {
        const businessHours = this.businessHoursRepository.create({
          business_id: businessId,
          day_of_week: hours.dayOfWeek,
          start_time: hours.startTime,
          end_time: hours.endTime,
        });

        await this.businessHoursRepository.save(businessHours);
      }
    }

    return { message: 'Business profile updated successfully' };
  }

  async updateBankingDetails(
    businessId: string,
    accountName: string,
    bsb: string,
    accountNumber: string,
  ) {
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!this.isBSBValid(bsb)) {
      throw new BadRequestException('Invalid BSB number');
    }

    if (!this.isAccountNumberValid(accountNumber)) {
      throw new BadRequestException('Invalid account number');
    }

    let bankingDetails = await this.bankingDetailsRepository.findOne({
      where: { business_id: businessId },
    });

    if (!bankingDetails) {
      bankingDetails = this.bankingDetailsRepository.create({
        business_id: businessId,
        account_name: accountName,
        bsb,
        account_number: accountNumber,
      });
    } else {
      bankingDetails.account_name = accountName;
      bankingDetails.bsb = bsb;
      bankingDetails.account_number = accountNumber;
    }

    await this.bankingDetailsRepository.save(bankingDetails);

    return { message: 'Banking details updated successfully' };
  }

  private isBSBValid(bsb: string): boolean {
    return /^\d{6}$/.test(bsb);
  }

  private isAccountNumberValid(accountNumber: string): boolean {
    return /^\d{8,12}$/.test(accountNumber);
  }
}

// backend/src/businesses/businesses.controller.ts
import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerBusiness(@Body() dto: any) {
    return this.businessesService.registerBusiness(dto);
  }

  @Get(':id')
  async getBusinessProfile(@Param('id') businessId: string) {
    return this.businessesService.getBusinessProfile(businessId);
  }

  @Put(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBusinessProfile(@Param('id') businessId: string, @Request() req: any, @Body() updates: any) {
    if (req.user.userId !== businessId) {
      throw new Error('Unauthorized');
    }
    return this.businessesService.updateBusinessProfile(businessId, updates);
  }

  @Put(':id/banking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async updateBankingDetails(
    @Param('id') businessId: string,
    @Request() req: any,
    @Body() dto: any,
  ) {
    if (req.user.userId !== businessId) {
      throw new Error('Unauthorized');
    }
    return this.businessesService.updateBankingDetails(
      businessId,
      dto.accountName,
      dto.bsb,
      dto.accountNumber,
    );
  }
}

// backend/src/businesses/businesses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity } from '../common/entities/business.entity';
import { UserEntity } from '../common/entities/user.entity';
import { BusinessServiceEntity } from '../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../common/entities/business-banking-details.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { ABNValidationService } from './abn-validation.service';
import { SendGridService } from '../notifications/sendgrid.service';
import { TwilioService } from '../notifications/twilio.service';

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
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService, ABNValidationService, SendGridService, TwilioService],
  exports: [BusinessesService],
})
export class BusinessesModule {}

// backend/src/common/entities/business-banking-details.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BusinessEntity } from './business.entity';

@Entity('business_banking_details')
@Index(['business_id'])
export class BusinessBankingDetailsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  business_id: string;

  @Column({ type: 'varchar', length: 255 })
  account_name: string;

  @Column({ type: 'varchar', length: 10 })
  bsb: string;

  @Column({ type: 'varchar', length: 20 })
  account_number: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_connect_account_id?: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => BusinessEntity, business => business.banking_details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}
