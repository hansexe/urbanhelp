import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('otp_codes')
@Index(['user_id'])
@Index(['code'])
@Index(['expires_at'])
export class OtpCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 6 })
  code!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'boolean', default: false })
  is_used!: boolean;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
