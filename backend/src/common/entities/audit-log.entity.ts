import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['action'])
@Index(['status'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resource?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: any;

  @Column({ type: 'varchar', length: 50, default: 'SUCCESS' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
