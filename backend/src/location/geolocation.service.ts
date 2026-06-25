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
