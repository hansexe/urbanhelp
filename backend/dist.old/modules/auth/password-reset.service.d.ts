import { Repository } from 'typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import { SendGridService } from '../notifications/sendgrid.service';
import { AuditService } from '../../common/services/audit.service';
export declare class PasswordResetService {
    private userRepository;
    private sendGridService;
    private auditService;
    private readonly logger;
    constructor(userRepository: Repository<UserEntity>, sendGridService: SendGridService, auditService: AuditService);
    initiatePasswordReset(email: string): Promise<void>;
    resetPassword(email: string, token: string, newPassword: string): Promise<void>;
    private validatePasswordStrength;
    private sendPasswordResetEmail;
    private sendPasswordResetConfirmationEmail;
}
