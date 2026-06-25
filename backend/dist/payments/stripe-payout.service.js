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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const business_entity_1 = require("../entities/business.entity");
const payment_entity_1 = require("../entities/payment.entity");
const sendgrid_service_1 = require("../modules/notifications/sendgrid.service");
const config_1 = require("../config/config");
let StripePayoutService = class StripePayoutService {
    constructor(businessRepository, paymentRepository, sendGridService) {
        this.businessRepository = businessRepository;
        this.paymentRepository = paymentRepository;
        this.sendGridService = sendGridService;
        this.commissionRate = 0.1; // 10%
        const config = (0, config_1.stripeConfig)();
        this.stripe = new stripe_1.default(config.secretKey || '', undefined);
    }
    async setupConnectAccount(businessId, email, businessName) {
        try {
            const business = await this.businessRepository.findOne({
                where: { id: businessId },
            });
            if (!business) {
                throw new common_1.NotFoundException('Business not found');
            }
            // Create Stripe Connect account
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: 'AU',
                email,
                business_profile: {
                    name: businessName,
                    support_phone: '+61-0-0-0-0-0-0',
                    support_email: email,
                    url: 'https://urbanhelp.com.au',
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                    au_becs_debit_payments: { requested: true },
                },
            });
            // Save Stripe account ID
            business.stripe_connect_account_id = account.id;
            await this.businessRepository.save(business);
            return account.id;
        }
        catch (error) {
            console.error('Stripe Connect setup error:', error);
            throw new common_1.BadRequestException('Failed to setup Stripe Connect account');
        }
    }
    async createAccountLink(businessId) {
        try {
            const business = await this.businessRepository.findOne({
                where: { id: businessId },
            });
            if (!business || !business.stripe_connect_account_id) {
                throw new common_1.NotFoundException('Stripe account not found');
            }
            const accountLink = await this.stripe.accountLinks.create({
                account: business.stripe_connect_account_id,
                type: 'account_onboarding',
                refresh_url: 'https://urbanhelp.com.au/business/stripe-refresh',
                return_url: 'https://urbanhelp.com.au/business/stripe-success',
            });
            return accountLink.url;
        }
        catch (error) {
            console.error('Account link creation error:', error);
            throw new common_1.BadRequestException('Failed to create account link');
        }
    }
    async transferFundsToConnectedAccount(paymentId, businessId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Payment not found');
            }
            const business = await this.businessRepository.findOne({
                where: { id: businessId },
            });
            if (!business || !business.stripe_connect_account_id) {
                throw new common_1.BadRequestException('Business Stripe account not set up');
            }
            // Calculate business amount (90% of total)
            const businessAmount = Math.round(payment.amount * 90 * 10); // in cents
            const transfer = await this.stripe.transfers.create({
                amount: businessAmount,
                currency: 'aud',
                destination: business.stripe_connect_account_id,
                transfer_group: `booking_${paymentId}`,
                metadata: {
                    paymentId,
                    businessId,
                    bookingId: payment.booking_id,
                },
            });
            // Update payment with transfer ID
            payment.transfer_id = transfer.id;
            await this.paymentRepository.save(payment);
            return transfer.id;
        }
        catch (error) {
            console.error('Transfer error:', error);
            throw new common_1.BadRequestException('Failed to transfer funds');
        }
    }
    async calculateMonthlyPayout(businessId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const payments = await this.paymentRepository.find({
            where: {
                business_id: businessId,
                payment_type: 'booking',
                status: 'succeeded',
                created_at: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const commission = Math.round(totalRevenue * this.commissionRate * 100) / 100;
        const payoutAmount = totalRevenue - commission;
        return {
            businessId,
            period: `${year}-${String(month).padStart(2, '0')}`,
            totalBookings: payments.length,
            totalRevenue,
            commission,
            payoutAmount,
            payoutDate: new Date(year, month, 1),
            status: 'pending',
        };
    }
    async processMonthlPayouts() {
        // Find all connected businesses
        const businesses = await this.businessRepository.find({
            where: {
                stripe_connect_account_id: '!= NULL',
                approval_status: 'approved',
            },
        });
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const year = lastMonth.getFullYear();
        const month = lastMonth.getMonth() + 1;
        for (const business of businesses) {
            try {
                const payout = await this.calculateMonthlyPayout(business.id, year, month);
                if (payout.payoutAmount > 0) {
                    // Initiate payout via Stripe
                    const payoutResponse = await this.stripe.payouts.create({
                        amount: Math.round(payout.payoutAmount * 100), // in cents
                        currency: 'aud',
                        method: 'instant',
                        metadata: {
                            businessId: business.id,
                            period: payout.period,
                        },
                    }, {
                        stripeAccount: business.stripe_connect_account_id,
                    });
                    // Send payout confirmation email
                    await this.sendGridService.sendPayoutProcessedEmail(business.user.email, business.name, payout.payoutAmount);
                }
            }
            catch (error) {
                console.error(`Payout processing error for business ${business.id}:`, error);
            }
        }
    }
    async getPayoutHistory(businessId) {
        try {
            const business = await this.businessRepository.findOne({
                where: { id: businessId },
            });
            if (!business || !business.stripe_connect_account_id) {
                return [];
            }
            const payouts = await this.stripe.payouts.list({ limit: 12 }, { stripeAccount: business.stripe_connect_account_id });
            return payouts.data.map((payout) => ({
                id: payout.id,
                amount: payout.amount / 100, // convert from cents
                currency: payout.currency,
                status: payout.status,
                arrivalDate: new Date(payout.arrival_date * 1000),
                createdDate: new Date(payout.created * 1000),
            }));
        }
        catch (error) {
            console.error('Payout history error:', error);
            return [];
        }
    }
    async verifyBankingDetails(businessId, bsb, accountNumber) {
        try {
            const business = await this.businessRepository.findOne({
                where: { id: businessId },
            });
            if (!business || !business.stripe_connect_account_id) {
                throw new common_1.BadRequestException('Business not found');
            }
            // Verify with Stripe
            const bankAccount = await this.stripe.accounts.createExternalAccount(business.stripe_connect_account_id, {
                external_account: {
                    object: 'bank_account',
                    country: 'AU',
                    currency: 'aud',
                    account_number: accountNumber,
                    routing_number: bsb,
                    account_holder_name: business.name,
                },
            });
            // Mark banking details as verified
            if (business.banking_details && business.banking_details.length > 0) {
                business.banking_details[0].is_verified = true;
            }
            await this.businessRepository.save(business);
            return true;
        }
        catch (error) {
            console.error('Bank verification error:', error);
            return false;
        }
    }
};
exports.StripePayoutService = StripePayoutService;
exports.StripePayoutService = StripePayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        sendgrid_service_1.SendGridService])
], StripePayoutService);
//# sourceMappingURL=stripe-payout.service.js.map