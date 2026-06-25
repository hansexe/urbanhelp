interface ABNRecord {
    acn: string;
    abn: string;
    entityType: string;
    entityName: string;
    businessName: string;
    state: string;
    lastUpdated: string;
    isActive: boolean;
}
export declare class ABNValidationService {
    private readonly ABN_LOOKUP_URL;
    validateABN(abn: string): Promise<ABNRecord | null>;
    private isValidABNFormat;
}
export {};
