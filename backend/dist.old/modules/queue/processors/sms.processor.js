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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const twilio_service_1 = require("../../notifications/twilio.service");
let SmsProcessor = class SmsProcessor {
    constructor(twilioService) {
        this.twilioService = twilioService;
    }
    async sendSMS(job) {
        const { phoneNumber, message } = job.data;
        try {
            await this.twilioService.sendSms(phoneNumber, message);
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
        }
    }
};
exports.SmsProcessor = SmsProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SmsProcessor.prototype, "sendSMS", null);
exports.SmsProcessor = SmsProcessor = __decorate([
    (0, bull_1.Processor)('sms'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService])
], SmsProcessor);
//# sourceMappingURL=sms.processor.js.map