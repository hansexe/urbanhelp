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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const stripe_payout_service_1 = require("../../payments/stripe-payout.service");
let PayoutProcessor = class PayoutProcessor {
    constructor(stripePayoutService) {
        this.stripePayoutService = stripePayoutService;
    }
    async processPayout(job) {
        if (job.data.type === 'monthly') {
            try {
                await this.stripePayoutService.processMonthlPayouts();
                return { success: true, type: 'monthly' };
            }
            catch (error) {
                throw new Error(`Monthly payout processing failed: ${error.message}`);
            }
        }
        const { businessId, amount, period } = job.data;
        try {
            // Payout processing logic
            return { success: true, businessId, amount, period };
        }
        catch (error) {
            throw new Error(`Payout failed for business ${businessId}: ${error.message}`);
        }
    }
};
exports.PayoutProcessor = PayoutProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutProcessor.prototype, "processPayout", null);
exports.PayoutProcessor = PayoutProcessor = __decorate([
    (0, bull_1.Processor)('payout'),
    __metadata("design:paramtypes", [typeof (_a = typeof stripe_payout_service_1.StripePayoutService !== "undefined" && stripe_payout_service_1.StripePayoutService) === "function" ? _a : Object])
], PayoutProcessor);
// Add to notifications/sendgrid.service.ts
async;
sendAccountLockedEmail(email, string, firstName, string);
Promise < void  > {
    const: config = sendgridConfig(),
    const: unlockLink = 'https://urbanhelp.com.au/auth/unlock-account',
    const: htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Temporarily Locked</h2>
      <p>Hi ${firstName},</p>
      <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
      <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>For security reasons, your account will be automatically unlocked in 30 minutes.</p>
        <p>If you did not attempt to log in, you can unlock your account immediately:</p>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${unlockLink}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Unlock Account</a>
      </p>
      <p>Best regards,<br>Urban Help Team</p>
    </div>
  `,
    await, sgMail, : .send({
        to: email,
        from: config.fromEmail,
        subject: 'Account Temporarily Locked',
        html: htmlContent,
    })
};
// Add to notifications/twilio.service.ts
async;
sendAccountLockedSMS(phoneNumber, string);
Promise < void  > {
    const: message = 'Urban Help: Your account has been locked for security. It will unlock in 30 minutes.',
    await, this: .sendSms(phoneNumber, message)
};
//# sourceMappingURL=payout.processor.js.map