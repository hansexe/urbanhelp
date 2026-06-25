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
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const sendgrid_service_1 = require("../../notifications/sendgrid.service");
let EmailProcessor = class EmailProcessor {
    constructor(sendGridService) {
        this.sendGridService = sendGridService;
    }
    async sendEmail(job) {
        const { to, subject, htmlContent } = job.data;
        try {
            await this.sendGridService.sendEmail(to, subject, htmlContent);
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "sendEmail", null);
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bull_1.Processor)('email'),
    __metadata("design:paramtypes", [sendgrid_service_1.SendGridService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map