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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlacesService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../config/config");
let GooglePlacesService = class GooglePlacesService {
    constructor() {
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
        const config = (0, config_1.googlePlacesConfig)();
        this.apiKey = config.apiKey || '';
        this.axios = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 5000,
        });
    }
    async autocomplete(input, sessionToken) {
        try {
            const response = await this.axios.get('/place/autocomplete/json', {
                params: {
                    input,
                    key: this.apiKey,
                    components: 'country:au',
                    language: 'en',
                    sessionToken,
                },
            });
            if (response.data.status !== 'OK') {
                return [];
            }
            return response.data.predictions.map((prediction) => ({
                placeId: prediction.place_id,
                mainText: prediction.structured_formatting?.main_text || '',
                secondaryText: prediction.structured_formatting?.secondary_text || '',
                fullText: prediction.description,
                description: prediction.description,
            }));
        }
        catch (error) {
            console.error('Google Places autocomplete error:', error);
            return [];
        }
    }
    async getPlaceDetails(placeId, sessionToken) {
        try {
            const response = await this.axios.get('/place/details/json', {
                params: {
                    place_id: placeId,
                    key: this.apiKey,
                    fields: 'formatted_address,geometry,address_component',
                    sessionToken,
                },
            });
            if (response.data.status !== 'OK') {
                return null;
            }
            const place = response.data.result;
            const components = place.address_components || [];
            let suburb = '';
            let state = '';
            let postcode = '';
            let country = '';
            components.forEach((component) => {
                if (component.types.includes('locality')) {
                    suburb = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                }
                if (component.types.includes('postal_code')) {
                    postcode = component.long_name;
                }
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
            });
            return {
                placeId,
                address: place.formatted_address,
                lat: place.geometry?.location?.lat || 0,
                lng: place.geometry?.location?.lng || 0,
                suburb,
                state,
                postcode,
                country,
            };
        }
        catch (error) {
            console.error('Google Places details error:', error);
            return null;
        }
    }
    async createSessionToken() {
        // Generate a unique session token for billing optimization
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.GooglePlacesService = GooglePlacesService;
exports.GooglePlacesService = GooglePlacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GooglePlacesService);
//# sourceMappingURL=google-places.service.js.map