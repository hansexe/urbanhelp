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
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const google_places_service_1 = require("./google-places.service");
const geolocation_service_1 = require("./geolocation.service");
let LocationController = class LocationController {
    constructor(googlePlacesService, geolocationService) {
        this.googlePlacesService = googlePlacesService;
        this.geolocationService = geolocationService;
    }
    async autocomplete(input, sessionToken) {
        if (!input || input.trim().length < 2) {
            throw new common_1.BadRequestException('Input must be at least 2 characters');
        }
        const results = await this.googlePlacesService.autocomplete(input, sessionToken);
        return {
            results: results.map((r) => ({
                placeId: r.placeId,
                mainText: r.mainText,
                secondaryText: r.secondaryText,
                description: r.description,
            })),
        };
    }
    async getPlaceDetails(placeId, sessionToken) {
        if (!placeId) {
            throw new common_1.BadRequestException('Place ID is required');
        }
        const details = await this.googlePlacesService.getPlaceDetails(placeId, sessionToken);
        if (!details) {
            throw new common_1.BadRequestException('Could not retrieve place details');
        }
        // Validate Australian location
        if (!this.geolocationService.isValidAustralianCoordinate(details.lat, details.lng)) {
            throw new common_1.BadRequestException('Location is not in Australia');
        }
        return {
            ...details,
            state: this.geolocationService.getStateFromCoordinates(details.lat, details.lng),
        };
    }
    async createSessionToken() {
        const token = await this.googlePlacesService.createSessionToken();
        return { sessionToken: token };
    }
    async calculateDistance(lat1, lng1, lat2, lng2) {
        const l1 = parseFloat(lat1);
        const n1 = parseFloat(lng1);
        const l2 = parseFloat(lat2);
        const n2 = parseFloat(lng2);
        if (isNaN(l1) || isNaN(n1) || isNaN(l2) || isNaN(n2)) {
            throw new common_1.BadRequestException('Invalid coordinates');
        }
        const distance = this.geolocationService.calculateDistance(l1, n1, l2, n2);
        return {
            distance,
            unit: 'km',
        };
    }
    async getBoundingBox(lat, lng, radius) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
            throw new common_1.BadRequestException('Invalid parameters');
        }
        if (radiusKm <= 0 || radiusKm > 100) {
            throw new common_1.BadRequestException('Radius must be between 0 and 100 km');
        }
        const box = this.geolocationService.getBoundingBox(latitude, longitude, radiusKm);
        return box;
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Get)('autocomplete'),
    __param(0, (0, common_1.Query)('input')),
    __param(1, (0, common_1.Query)('sessionToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)('place-details'),
    __param(0, (0, common_1.Query)('placeId')),
    __param(1, (0, common_1.Query)('sessionToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getPlaceDetails", null);
__decorate([
    (0, common_1.Get)('session-token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createSessionToken", null);
__decorate([
    (0, common_1.Get)('distance'),
    __param(0, (0, common_1.Query)('lat1')),
    __param(1, (0, common_1.Query)('lng1')),
    __param(2, (0, common_1.Query)('lat2')),
    __param(3, (0, common_1.Query)('lng2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "calculateDistance", null);
__decorate([
    (0, common_1.Get)('bounding-box'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getBoundingBox", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('location'),
    __metadata("design:paramtypes", [google_places_service_1.GooglePlacesService,
        geolocation_service_1.GeolocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map