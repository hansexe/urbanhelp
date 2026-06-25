import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { Module } from '@nestjs/common';
// RedisModule initialization moved to AppModule (canonical root). Do not initialize here.

// Services
import { RedisService } from './services/redis.service';
import { AuditService } from './services/audit.service';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity]),

    // RedisModule initialization must be performed once in AppModule
  ],
  providers: [
    RedisService,
    AuditService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    RedisService,
    AuditService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class CommonModule {}
