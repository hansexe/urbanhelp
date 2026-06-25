import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
export declare class AuditService {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: Repository<AuditLogEntity>);
    log(event: {
        action: string;
        resource?: string;
        details?: any;
        status?: string;
    }): Promise<void>;
}
