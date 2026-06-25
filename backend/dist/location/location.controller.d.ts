import { GooglePlacesService } from './google-places.service';
import { GeolocationService } from './geolocation.service';
export declare class LocationController {
    private googlePlacesService;
    private geolocationService;
    constructor(googlePlacesService: GooglePlacesService, geolocationService: GeolocationService);
    autocomplete(input: string, sessionToken?: string): Promise<{
        results: {
            placeId: string;
            mainText: string;
            secondaryText: string;
            description: string;
        }[];
    }>;
    getPlaceDetails(placeId: string, sessionToken?: string): Promise<{
        state: string | null;
        placeId: string;
        address: string;
        lat: number;
        lng: number;
        suburb: string;
        postcode: string;
        country: string;
    }>;
    createSessionToken(): Promise<{
        sessionToken: string;
    }>;
    calculateDistance(lat1: string, lng1: string, lat2: string, lng2: string): Promise<{
        distance: number;
        unit: string;
    }>;
    getBoundingBox(lat: string, lng: string, radius: string): Promise<{
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    }>;
}
