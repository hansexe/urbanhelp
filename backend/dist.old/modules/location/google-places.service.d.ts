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
export declare class GooglePlacesService {
    private axios;
    private readonly baseUrl;
    private readonly apiKey;
    constructor();
    autocomplete(input: string, sessionToken?: string): Promise<PlacesAutocompleteResult[]>;
    getPlaceDetails(placeId: string, sessionToken?: string): Promise<PlaceDetails | null>;
    createSessionToken(): Promise<string>;
}
