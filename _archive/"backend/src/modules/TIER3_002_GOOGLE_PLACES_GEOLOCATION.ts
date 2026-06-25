// backend/src/location/google-places.service.ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { googlePlacesConfig } from '../config/config';

export interface PlacesAutocompleteResult {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  description: string;
}

export interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

@Injectable()
export class GooglePlacesService {
  private axios: AxiosInstance;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';
  private readonly apiKey: string;

  constructor() {
    const config = googlePlacesConfig();
    this.apiKey = config.apiKey;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
    });
  }

  async autocomplete(
    input: string,
    sessionToken?: string,
  ): Promise<PlacesAutocompleteResult[]> {
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

      return response.data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting?.main_text || '',
        secondaryText: prediction.structured_formatting?.secondary_text || '',
        fullText: prediction.description,
        description: prediction.description,
      }));
    } catch (error) {
      console.error('Google Places autocomplete error:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string, sessionToken?: string): Promise<PlaceDetails | null> {
    try {
      const response = await this.axios.get('/place/details/json', {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields:
            'formatted_address,geometry,address_component',
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

      components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          suburb = component.long_name;
        }
        if (
          component.types.includes('administrative_area_level_1')
        ) {
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
    } catch (error) {
      console.error('Google Places details error:', error);
      return null;
    }
  }

  async createSessionToken(): Promise<string> {
    // Generate a unique session token for billing optimization
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// backend/src/location/geolocation.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchLocation {
  lat: number;
  lng: number;
  radiusKm: number;
  suburb?: string;
  postcode?: string;
}

@Injectable()
export class GeolocationService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Filter businesses by distance from customer location
   */
  filterByDistance(
    businesses: any[],
    customerLat: number,
    customerLng: number,
    maxDistanceKm: number,
  ): any[] {
    return businesses.filter((business) => {
      const distance = this.calculateDistance(
        customerLat,
        customerLng,
        business.lat,
        business.lng,
      );
      return distance <= maxDistanceKm;
    });
  }

  /**
   * Sort businesses by distance from customer location
   */
  sortByDistance(
    businesses: any[],
    customerLat: number,
    customerLng: number,
  ): any[] {
    return businesses.sort((a, b) => {
      const distanceA = this.calculateDistance(
        customerLat,
        customerLng,
        a.lat,
        a.lng,
      );
      const distanceB = this.calculateDistance(
        customerLat,
        customerLng,
        b.lat,
        b.lng,
      );
      return distanceA - distanceB;
    });
  }

  /**
   * Get bounding box for approximate area search
   */
  getBoundingBox(
    lat: number,
    lng: number,
    radiusKm: number,
  ): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    const latChange = radiusKm / 111.0; // 1 degree latitude ≈ 111 km
    const lngChange = radiusKm / (111.0 * Math.cos(this.toRad(lat)));

    return {
      minLat: lat - latChange,
      maxLat: lat + latChange,
      minLng: lng - lngChange,
      maxLng: lng + lngChange,
    };
  }

  /**
   * Validate Australian coordinates
   */
  isValidAustralianCoordinate(lat: number, lng: number): boolean {
    // Australia bounds approximately
    const minLat = -44.0;
    const maxLat = -9.6;
    const minLng = 112.9;
    const maxLng = 154.5;

    return (
      lat >= minLat &&
      lat <= maxLat &&
      lng >= minLng &&
      lng <= maxLng
    );
  }

  /**
   * Get Australian state from coordinates
   */
  getStateFromCoordinates(lat: number, lng: number): string | null {
    // Simplified state boundaries (approximate centers)
    const states = [
      { code: 'NSW', minLat: -37.5, maxLat: -28.0, minLng: 141.0, maxLng: 154.5 },
      { code: 'VIC', minLat: -39.5, maxLat: -34.0, minLng: 141.0, maxLng: 150.0 },
      { code: 'QLD', minLat: -29.0, maxLat: -9.6, minLng: 138.0, maxLng: 154.0 },
      { code: 'WA', minLat: -35.5, maxLat: -13.5, minLng: 112.9, maxLng: 129.0 },
      { code: 'SA', minLat: -37.5, maxLat: -26.0, minLng: 129.0, maxLng: 141.0 },
      { code: 'TAS', minLat: -44.0, maxLat: -40.5, minLng: 144.0, maxLng: 148.5 },
      { code: 'NT', minLat: -26.0, maxLat: -11.0, minLng: 129.0, maxLng: 138.0 },
      { code: 'ACT', minLat: -35.8, maxLat: -35.1, minLng: 148.7, maxLng: 149.5 },
    ];

    for (const state of states) {
      if (
        lat >= state.minLat &&
        lat <= state.maxLat &&
        lng >= state.minLng &&
        lng <= state.maxLng
      ) {
        return state.code;
      }
    }

    return null;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// backend/src/location/location.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { GeolocationService } from './geolocation.service';

@Controller('location')
export class LocationController {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private geolocationService: GeolocationService,
  ) {}

  @Get('autocomplete')
  async autocomplete(
    @Query('input') input: string,
    @Query('sessionToken') sessionToken?: string,
  ) {
    if (!input || input.trim().length < 2) {
      throw new BadRequestException('Input must be at least 2 characters');
    }

    const results = await this.googlePlacesService.autocomplete(
      input,
      sessionToken,
    );

    return {
      results: results.map((r) => ({
        placeId: r.placeId,
        mainText: r.mainText,
        secondaryText: r.secondaryText,
        description: r.description,
      })),
    };
  }

  @Get('place-details')
  async getPlaceDetails(
    @Query('placeId') placeId: string,
    @Query('sessionToken') sessionToken?: string,
  ) {
    if (!placeId) {
      throw new BadRequestException('Place ID is required');
    }

    const details = await this.googlePlacesService.getPlaceDetails(
      placeId,
      sessionToken,
    );

    if (!details) {
      throw new BadRequestException('Could not retrieve place details');
    }

    // Validate Australian location
    if (!this.geolocationService.isValidAustralianCoordinate(details.lat, details.lng)) {
      throw new BadRequestException('Location is not in Australia');
    }

    return {
      ...details,
      state: this.geolocationService.getStateFromCoordinates(
        details.lat,
        details.lng,
      ),
    };
  }

  @Get('session-token')
  async createSessionToken() {
    const token = await this.googlePlacesService.createSessionToken();
    return { sessionToken: token };
  }

  @Get('distance')
  async calculateDistance(
    @Query('lat1') lat1: string,
    @Query('lng1') lng1: string,
    @Query('lat2') lat2: string,
    @Query('lng2') lng2: string,
  ) {
    const l1 = parseFloat(lat1);
    const n1 = parseFloat(lng1);
    const l2 = parseFloat(lat2);
    const n2 = parseFloat(lng2);

    if (isNaN(l1) || isNaN(n1) || isNaN(l2) || isNaN(n2)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const distance = this.geolocationService.calculateDistance(l1, n1, l2, n2);

    return {
      distance,
      unit: 'km',
    };
  }

  @Get('bounding-box')
  async getBoundingBox(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      throw new BadRequestException('Invalid parameters');
    }

    if (radiusKm <= 0 || radiusKm > 100) {
      throw new BadRequestException('Radius must be between 0 and 100 km');
    }

    const box = this.geolocationService.getBoundingBox(latitude, longitude, radiusKm);

    return box;
  }
}

// backend/src/location/location.module.ts
import { Module } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { GeolocationService } from './geolocation.service';
import { LocationController } from './location.controller';

@Module({
  controllers: [LocationController],
  providers: [GooglePlacesService, GeolocationService],
  exports: [GooglePlacesService, GeolocationService],
})
export class LocationModule {}
