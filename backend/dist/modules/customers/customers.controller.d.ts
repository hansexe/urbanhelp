import { CustomersService } from './customers.service';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
    findAll(): Promise<import("../../entities/customer.entity").CustomerEntity[]>;
    findOne(id: string): Promise<import("../../entities/customer.entity").CustomerEntity | null>;
}
