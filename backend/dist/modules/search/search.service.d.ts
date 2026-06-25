import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
export declare class SearchService {
    private businessRepository;
    constructor(businessRepository: Repository<BusinessEntity>);
    search(query: string): Promise<BusinessEntity[]>;
}
