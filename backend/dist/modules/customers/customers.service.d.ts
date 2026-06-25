import { Repository } from 'typeorm';
import { CustomerEntity } from '../../common/entities/customer.entity';
export declare class CustomersService {
    private customerRepository;
    constructor(customerRepository: Repository<CustomerEntity>);
    findAll(): Promise<CustomerEntity[]>;
    findOne(id: string): Promise<CustomerEntity | null>;
}
