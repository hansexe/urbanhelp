"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABNValidationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ABNValidationService = class ABNValidationService {
    constructor() {
        this.ABN_LOOKUP_URL = 'https://api.asic.gov.au/file/abn-search-api';
    }
    async validateABN(abn) {
        const cleanedABN = abn.replace(/\s/g, '');
        if (!this.isValidABNFormat(cleanedABN)) {
            return null;
        }
        try {
            const response = await axios_1.default.get(`${this.ABN_LOOKUP_URL}?abn=${cleanedABN}&format=json`, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Urban-Help/1.0',
                },
            });
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
        }
        catch (error) {
            console.error('ABN validation error:', error);
            return null;
        }
    }
    isValidABNFormat(abn) {
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
};
exports.ABNValidationService = ABNValidationService;
exports.ABNValidationService = ABNValidationService = __decorate([
    (0, common_1.Injectable)()
], ABNValidationService);
//# sourceMappingURL=abn-validation.service.js.map