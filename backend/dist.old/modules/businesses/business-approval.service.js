"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessApprovalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../../common/entities/business.entity");
const user_entity_1 = require("../../common/entities/user.entity");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
const twilio_service_1 = require("../notifications/twilio.service");
let BusinessApprovalService = class BusinessApprovalService {
    constructor(businessRepository, userRepository, sendGridService, twilioService) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.sendGridService = sendGridService;
        this.twilioService = twilioService;
    }
    async approveBusiness(dto) {
        const business = await this.businessRepository.findOne({
            where: { id: dto.businessId },
            relations: ['user'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (business.approval_status !== 'pending') {
            throw new common_1.BadRequestException(`Cannot approve business with status: ${business.approval_status}`);
        }
        business.approval_status = 'approved';
        business.approval_notes = dto.adminNotes || 'Approved by admin';
        business.approved_at = new Date();
        await this.businessRepository.save(business);
        // Send notifications
        try {
            await this.sendGridService.sendBusinessApprovalEmail(business.user.email, business.name);
            await this.twilioService.sendBusinessApprovalSMS(business.user.phone_number, business.name);
        }
        catch (error) {
            console.error('Failed to send approval notifications:', error);
        }
        return business;
    }
    async rejectBusiness(dto) {
        const business = await this.businessRepository.findOne({
            where: { id: dto.businessId },
            relations: ['user'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (business.approval_status !== 'pending') {
            throw new common_1.BadRequestException(`Cannot reject business with status: ${business.approval_status}`);
        }
        business.approval_status = 'rejected';
        business.approval_notes = dto.rejectionReason;
        business.rejected_at = new Date();
        await this.businessRepository.save(business);
        // Send notifications
        try {
            await this.sendGridService.sendBusinessRejectionEmail(business.user.email, business.name, dto.rejectionReason);
            await this.twilioService.sendBusinessRejectionSMS(business.user.phone_number);
        }
        catch (error) {
            console.error('Failed to send rejection notifications:', error);
        }
        return business;
    }
    async getPendingApprovals() {
        return this.businessRepository.find({
            where: { approval_status: 'pending' },
            relations: ['user', 'services', 'images'],
            order: { created_at: 'ASC' },
        });
    }
    async getBusinessApprovalDetails(businessId) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
            relations: ['user', 'services', 'hours', 'images', 'banking_details'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        return business;
    }
    async getApprovalStats() {
        const [pending, approved, rejected, total] = await Promise.all([
            this.businessRepository.countBy({ approval_status: 'pending' }),
            this.businessRepository.countBy({ approval_status: 'approved' }),
            this.businessRepository.countBy({ approval_status: 'rejected' }),
            this.businessRepository.count(),
        ]);
        return { pending, approved, rejected, total };
    }
};
exports.BusinessApprovalService = BusinessApprovalService;
exports.BusinessApprovalService = BusinessApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        sendgrid_service_1.SendGridService,
        twilio_service_1.TwilioService])
], BusinessApprovalService);
//# sourceMappingURL=business-approval.service.js.map