import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async log(event: { action: string; resource?: string; details?: any; status?: string }) {
    try {
      const record = this.auditRepo.create({
        action: event.action,
        resource: event.resource,
        details: event.details,
        status: event.status || 'SUCCESS',
      });

      await this.auditRepo.save(record);
      this.logger.debug(`Audit logged: ${event.action}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
      this.logger.error('Failed to persist audit log', errorMessage);
    }
  }
}
