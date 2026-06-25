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
