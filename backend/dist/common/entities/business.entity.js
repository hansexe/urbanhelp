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
exports.BusinessEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const business_service_entity_1 = require("./business-service.entity");
const business_hours_entity_1 = require("./business-hours.entity");
const business_image_entity_1 = require("./business-image.entity");
const business_banking_details_entity_1 = require("./business-banking-details.entity");
let BusinessEntity = class BusinessEntity {
    // Backwards-compatible aliases / computed properties
    get service_radius_km() {
        return this.service_radius;
    }
    set service_radius_km(v) {
        this.service_radius = v;
    }
    get website() {
        return this.website_url;
    }
    set website(v) {
        this.website_url = v;
    }
    get hours() {
        return this.business_hours;
    }
    set hours(v) {
        this.business_hours = v;
    }
    get average_rating() {
        return this.avg_rating;
    }
    set average_rating(v) {
        this.avg_rating = v;
    }
};
exports.BusinessEntity = BusinessEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], BusinessEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "abn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "business_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "business_mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "business_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "suburb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 25 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "service_radius", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "website_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "qualifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "licences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "avg_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "total_reviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "is_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "is_approved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'pending' }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "approval_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "rejection_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "is_suspended", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "suspension_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "stripe_charges_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], BusinessEntity.prototype, "stripe_payouts_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "stripe_connect_account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessEntity.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "approval_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessEntity.prototype, "rejected_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.UserEntity, user => user.business),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.UserEntity)
], BusinessEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_service_entity_1.BusinessServiceEntity, service => service.business),
    __metadata("design:type", Array)
], BusinessEntity.prototype, "services", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_hours_entity_1.BusinessHoursEntity, hours => hours.business),
    __metadata("design:type", Array)
], BusinessEntity.prototype, "business_hours", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_image_entity_1.BusinessImageEntity, image => image.business),
    __metadata("design:type", Array)
], BusinessEntity.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_banking_details_entity_1.BusinessBankingDetailsEntity, details => details.business),
    __metadata("design:type", Array)
], BusinessEntity.prototype, "banking_details", void 0);
exports.BusinessEntity = BusinessEntity = __decorate([
    (0, typeorm_1.Entity)('businesses'),
    (0, typeorm_1.Index)(['suburb']),
    (0, typeorm_1.Index)(['postcode']),
    (0, typeorm_1.Index)(['is_approved']),
    (0, typeorm_1.Index)(['is_suspended']),
    (0, typeorm_1.Index)(['created_at'])
], BusinessEntity);
//# sourceMappingURL=business.entity.js.map