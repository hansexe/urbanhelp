import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../../common/entities/business-banking-details.entity';
import { ABNValidationService } from './abn-validation.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
import { BusinessRegistrationDto } from '../../dtos/business/business-registration.dto';
import {
  UpdateBusinessProfileDto,
  UpdateBankingDetailsDto,
} from '../../dtos/business/business-update.dto';

/**
 * BusinessesService
 * Handles all business registration, profile management, and banking details
 *
 * Security:
 * - Duplicate prevention: ABN, email validation before registration
 * - Password hashing: bcrypt with 12 rounds
 * - Banking details validation: BSB and account number format checks
 * - Transaction safety: All database operations use proper exception handling
 * - Ownership: Profile updates only accessible by business owner
 */

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
    private dataSource: DataSource,
    private abnValidationService: ABNValidationService,
    private sendGridService: SendGridService,
    private twilioService: TwilioService,
  ) {}

  /**
   * Register a new business
   * Creates user account + business profile + services + hours + banking details
   *
   * Validation:
   * - ABN must be unique and active
   * - Email must be unique across system
   * - BSB and account number must pass format validation
   * - Password must meet strength requirements (validated in DTO)
   *
   * Security:
   * - Password hashed with bcrypt (12 rounds)
   * - User created as 'business' role
   * - Business marked as pending approval
   * - No sensitive data logged or exposed
   *
   * @param dto - BusinessRegistrationDto with all registration details
   * @returns Registration confirmation with business ID
   * @throws ConflictException - ABN or email already registered
   * @throws BadRequestException - Invalid ABN, BSB, or account number
   */
  async registerBusiness(dto: BusinessRegistrationDto) {
    // Normalize ABN (remove whitespace)
    const abn = dto.abn.replace(/\s/g, '');

    // DUPLICATE PREVENTION: Check for existing ABN registration
    const existingBusiness = await this.businessesRepository.findOne({
      where: { abn },
    });

    if (existingBusiness) {
      throw new ConflictException(
        'A business with this ABN has already been registered',
      );
    }

    // DUPLICATE PREVENTION: Check for existing email
    const existingEmail = await this.usersRepository.findOne({
      where: { email: dto.businessEmail },
    });

    if (existingEmail) {
      throw new ConflictException(
        'An account with this email address already exists',
      );
    }

    // VALIDATION: Verify ABN is valid and active with ASIC
    const abnRecord = await this.abnValidationService.validateABN(abn);

    if (!abnRecord || !abnRecord.isActive) {
      throw new BadRequestException(
        'ABN is invalid or not active. Please verify your ABN with ASIC.',
      );
    }

    // VALIDATION: Banking details format checks
    if (!this.isBSBValid(dto.banking.bsb)) {
      throw new BadRequestException('Invalid BSB number format');
    }

    if (!this.isAccountNumberValid(dto.banking.accountNumber)) {
      throw new BadRequestException('Invalid account number format');
    }

    // SECURITY: Hash password with bcrypt
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // TRANSACTION: Wrap all database operations in atomic transaction
    // This ensures all 5 tables (Users, Businesses, BusinessServices, BusinessHours, BankingDetails)
    // are written successfully or all are rolled back on ANY failure
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedUser: any;
    try {
      // Create user account (inside transaction)
      const user = queryRunner.manager.create('User', {
        email: dto.businessEmail,
        mobile: dto.businessMobile,
        password_hash: passwordHash,
        first_name: dto.ownerName.split(' ')[0],
        last_name: dto.ownerName.split(' ').slice(1).join(' '),
        role: 'business',
        is_verified: false,
      });

      savedUser = await queryRunner.manager.save(user);

      // Create business profile (inside transaction)
      const business = queryRunner.manager.create('Business', {
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
        licences: dto.licences || '',
        approval_status: 'pending',
        is_verified: false,
        is_approved: false,
      } as any);

      await queryRunner.manager.save(business);

      // Create business services (inside transaction)
      for (const service of dto.services) {
        const businessService = queryRunner.manager.create('BusinessService', {
          business_id: savedUser.id,
          service_type: service.serviceType,
          business_hours_fee: service.businessHoursFee,
          out_of_hours_fee: service.outOfHoursFee,
        });

        await queryRunner.manager.save(businessService);
      }

      // Create business hours (inside transaction)
      for (const hours of dto.businessHours) {
        const businessHours = queryRunner.manager.create('BusinessHours', {
          business_id: savedUser.id,
          day_of_week: hours.dayOfWeek,
          start_time: hours.startTime,
          end_time: hours.endTime,
        });

        await queryRunner.manager.save(businessHours);
      }

      // Create banking details (inside transaction)
      const bankingDetails = queryRunner.manager.create('BankingDetails', {
        business_id: savedUser.id,
        account_name: dto.banking.accountName,
        bsb: dto.banking.bsb,
        account_number: dto.banking.accountNumber,
      });

      await queryRunner.manager.save(bankingDetails);

      // Commit transaction - all writes successful
      await queryRunner.commitTransaction();
    } catch (error) {
      // ROLLBACK: On ANY failure, rollback all changes to maintain data consistency
      await queryRunner.rollbackTransaction();

      // Propagate appropriate NestJS exception (don't swallow errors)
      if (error instanceof ConflictException ||
          error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Business registration failed. Please try again or contact support.',
      );
    } finally {
      // Release connection back to pool
      await queryRunner.release();
    }

    // Send confirmation notifications (outside transaction - non-critical)
    try {
      await this.sendGridService.sendBusinessRegistrationEmail(
        dto.businessEmail,
        dto.businessName,
      );
      await this.twilioService.sendBusinessRegistrationSMS(
        dto.businessMobile,
        dto.businessName,
      );
    } catch (error) {
      console.error('Failed to send registration notifications:', error);
      // Do not fail registration if notifications fail
    }

    return {
      businessId: savedUser.id,
      status: 'pending_approval',
      message:
        'Business registered successfully. Awaiting approval from Urban Help team.',
    };
  }

  /**
   * Get business profile
   * Retrieves complete business information including services, hours, images
   * Public endpoint - no authentication required
   *
   * @param businessId - Business ID (UUID)
   * @returns Complete business profile with all related data
   * @throws NotFoundException - Business not found
   */
  async getBusinessProfile(businessId: string) {
    // Retrieve business basic information
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

  /**
   * Update business profile
   * Allows business owner to update profile information
   *
   * Security:
   * - Ownership verified by controller before calling this method
   * - Business existence verified
   * - Services and hours can be updated
   * - Updated timestamp tracked for audit
   *
   * @param businessId - Business ID (UUID)
   * @param updates - UpdateBusinessProfileDto with optional fields
   * @returns Confirmation message
   * @throws NotFoundException - Business not found
   */
  async updateBusinessProfile(
    businessId: string,
    updates: UpdateBusinessProfileDto,
  ) {
    // IMMUTABLE FIELD PROTECTION: Reject attempts to modify critical fields
    // These fields should NEVER be modifiable after creation
    const immutableFields = [
      'abn',
      'businessId',
      'id',
      'userId',
      'approvalStatus',
      'approval_status',
      'isVerified',
      'is_verified',
      'createdAt',
      'created_at',
      'verificationStatus',
      'isApproved',
      'is_approved',
    ];

    const updateKeys = Object.keys(updates || {});
    const attemptedImmutableFields = updateKeys.filter((key) =>
      immutableFields.includes(key),
    );

    if (attemptedImmutableFields.length > 0) {
      throw new ForbiddenException(
        `Cannot modify immutable fields: ${attemptedImmutableFields.join(', ')}. ` +
        'These fields are protected and can only be changed through admin approval workflows.',
      );
    }

    // Verify business exists
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update profile fields if provided
    if (updates.businessName) {
      business.name = updates.businessName;
    }
    if (updates.description) {
      business.description = updates.description;
    }
    if (updates.experience) {
      business.experience = updates.experience;
    }
    if (updates.qualifications) {
      business.qualifications = updates.qualifications;
    }
    if (updates.licences) {
      business.licences = updates.licences;
    }
    if (updates.websiteUrl) {
      business.website_url = updates.websiteUrl;
    }
    if (updates.serviceRadius !== undefined) {
      business.service_radius = updates.serviceRadius;
    }

    // Track update timestamp
    business.updated_at = new Date();

    await this.businessesRepository.save(business);

    // Update services if provided
    if (updates.services && updates.services.length > 0) {
      // Delete existing services
      await this.businessServicesRepository.delete({ business_id: businessId });

      // Create new services
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

    // Update business hours if provided
    if (updates.businessHours && updates.businessHours.length > 0) {
      // Delete existing hours
      await this.businessHoursRepository.delete({ business_id: businessId });

      // Create new hours
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

  /**
   * Update banking details
   * Validates and updates business banking information
   *
   * Security:
   * - Business existence verified before update
   * - Banking details format validated (BSB, account number)
   * - Error handling prevents information leakage
   *
   * @param businessId - Business ID (UUID)
   * @param dto - UpdateBankingDetailsDto with account details
   * @returns Confirmation message
   * @throws NotFoundException - Business not found
   * @throws BadRequestException - Invalid banking details format
   */
  async updateBankingDetails(
    businessId: string,
    dto: UpdateBankingDetailsDto,
  ) {
    // Verify business exists
    const business = await this.businessesRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // VALIDATION: BSB format check
    if (!this.isBSBValid(dto.bsb)) {
      throw new BadRequestException('Invalid BSB number format');
    }

    // VALIDATION: Account number format check
    if (!this.isAccountNumberValid(dto.accountNumber)) {
      throw new BadRequestException('Invalid account number format');
    }

    // Find or create banking details
    let bankingDetails = await this.bankingDetailsRepository.findOne({
      where: { business_id: businessId },
    });

    if (!bankingDetails) {
      bankingDetails = this.bankingDetailsRepository.create({
        business_id: businessId,
        account_name: dto.accountName,
        bsb: dto.bsb,
        account_number: dto.accountNumber,
      });
    } else {
      bankingDetails.account_name = dto.accountName;
      bankingDetails.bsb = dto.bsb;
      bankingDetails.account_number = dto.accountNumber;
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
