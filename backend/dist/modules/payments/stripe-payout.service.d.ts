import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
export declare class StripePayoutService {
    private businessRepository;
    private readonly logger;
    private stripe;
    constructor(businessRepository: Repository<BusinessEntity>);
    processMonthlPayouts(): Promise<void>;
}
