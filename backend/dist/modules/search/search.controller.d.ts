import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(query: string): Promise<import("../../entities/business.entity").BusinessEntity[]>;
}
