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
export declare class GeolocationService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
    /**
     * Filter businesses by distance from customer location
     */
    filterByDistance(businesses: any[], customerLat: number, customerLng: number, maxDistanceKm: number): any[];
    /**
     * Sort businesses by distance from customer location
     */
    sortByDistance(businesses: any[], customerLat: number, customerLng: number): any[];
    /**
     * Get bounding box for approximate area search
     */
    getBoundingBox(lat: number, lng: number, radiusKm: number): {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    };
    /**
     * Validate Australian coordinates
     */
    isValidAustralianCoordinate(lat: number, lng: number): boolean;
    /**
     * Get Australian state from coordinates
     */
    getStateFromCoordinates(lat: number, lng: number): string | null;
    private toRad;
}
