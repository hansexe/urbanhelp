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
    this.apiKey = config.apiKey || '';
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
