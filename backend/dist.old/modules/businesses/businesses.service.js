"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const business_entity_1 = require("../../common/entities/business.entity");
const user_entity_1 = require("../../common/entities/user.entity");
const business_service_entity_1 = require("../../common/entities/business-service.entity");
const business_hours_entity_1 = require("../../common/entities/business-hours.entity");
const business_image_entity_1 = require("../../common/entities/business-image.entity");
const business_banking_details_entity_1 = require("../../common/entities/business-banking-details.entity");
const abn_validation_service_1 = require("./abn-validation.service");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
const twilio_service_1 = require("../notifications/twilio.service");
let BusinessesService = class BusinessesService {
    constructor(businessesRepository, usersRepository, businessServicesRepository, businessHoursRepository, businessImagesRepository, bankingDetailsRepository, abnValidationService, sendGridService, twilioService) {
        this.businessesRepository = businessesRepository;
        this.usersRepository = usersRepository;
        this.businessServicesRepository = businessServicesRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.businessImagesRepository = businessImagesRepository;
        this.bankingDetailsRepository = bankingDetailsRepository;
        this.abnValidationService = abnValidationService;
        this.sendGridService = sendGridService;
        this.twilioService = twilioService;
    }
    async registerBusiness(dto) {
        const abn = dto.abn.replace(/\s/g, '');
        const existingBusiness = await this.businessesRepository.findOne({
            where: { abn },
        });
        if (existingBusiness) {
            throw new common_1.ConflictException('Business with this ABN already registered');
        }
        const existingEmail = await this.usersRepository.findOne({
            where: { email: dto.businessEmail },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already registered');
        }
        const abnRecord = await this.abnValidationService.validateABN(abn);
        if (!abnRecord || !abnRecord.isActive) {
            throw new common_1.BadRequestException('ABN is invalid or not active');
        }
        if (!this.isBSBValid(dto.bsb)) {
            throw new common_1.BadRequestException('Invalid BSB number');
        }
        if (!this.isAccountNumberValid(dto.accountNumber)) {
            throw new common_1.BadRequestException('Invalid account number');
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
    async getBusinessProfile(businessId) {
        const business = await this.businessesRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
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
    async updateBusinessProfile(businessId, updates) {
        const business = await this.businessesRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (updates.businessName)
            business.name = updates.businessName;
        if (updates.description)
            business.description = updates.description;
        if (updates.experience)
            business.experience = updates.experience;
        if (updates.qualifications)
            business.qualifications = updates.qualifications;
        if (updates.licences)
            business.licences = updates.licences;
        if (updates.websiteUrl)
            business.website_url = updates.websiteUrl;
        if (updates.serviceRadius)
            business.service_radius = updates.serviceRadius;
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
    async updateBankingDetails(businessId, accountName, bsb, accountNumber) {
        const business = await this.businessesRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (!this.isBSBValid(bsb)) {
            throw new common_1.BadRequestException('Invalid BSB number');
        }
        if (!this.isAccountNumberValid(accountNumber)) {
            throw new common_1.BadRequestException('Invalid account number');
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
        }
        else {
            bankingDetails.account_name = accountName;
            bankingDetails.bsb = bsb;
            bankingDetails.account_number = accountNumber;
        }
        await this.bankingDetailsRepository.save(bankingDetails);
        return { message: 'Banking details updated successfully' };
    }
    isBSBValid(bsb) {
        return /^\d{6}$/.test(bsb);
    }
    isAccountNumberValid(accountNumber) {
        return /^\d{8,12}$/.test(accountNumber);
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_service_entity_1.BusinessServiceEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHoursEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(business_image_entity_1.BusinessImageEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(business_banking_details_entity_1.BusinessBankingDetailsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        abn_validation_service_1.ABNValidationService,
        sendgrid_service_1.SendGridService,
        twilio_service_1.TwilioService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map