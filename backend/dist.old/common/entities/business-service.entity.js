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
exports.BusinessServiceEntity = void 0;
const typeorm_1 = require("typeorm");
const business_entity_1 = require("./business.entity");
let BusinessServiceEntity = class BusinessServiceEntity {
    // Compatibility aliases
    get service_name() {
        return this.service_type;
    }
    set service_name(v) {
        this.service_type = v;
    }
    get hourly_rate() {
        return Number(this.business_hours_fee);
    }
    set hourly_rate(v) {
        this.business_hours_fee = v;
    }
};
exports.BusinessServiceEntity = BusinessServiceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessServiceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BusinessServiceEntity.prototype, "business_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BusinessServiceEntity.prototype, "service_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BusinessServiceEntity.prototype, "business_hours_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BusinessServiceEntity.prototype, "out_of_hours_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessServiceEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BusinessServiceEntity.prototype, "out_of_hours_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BusinessServiceEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessServiceEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessServiceEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_entity_1.BusinessEntity, business => business.services, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.BusinessEntity)
], BusinessServiceEntity.prototype, "business", void 0);
exports.BusinessServiceEntity = BusinessServiceEntity = __decorate([
    (0, typeorm_1.Entity)('business_services'),
    (0, typeorm_1.Index)(['business_id']),
    (0, typeorm_1.Index)(['service_type'])
], BusinessServiceEntity);
//# sourceMappingURL=business-service.entity.js.map