import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CustomerEntity } from './customer.entity';
import { BusinessEntity } from './business.entity';

@Entity('users')
@Index(['email'])
@Index(['mobile'])
@Index(['role'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  mobile?: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password_hash!: string;

  @Column({ type: 'varchar', nullable: true })
  reset_token_hash?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires_at?: Date | null;

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ type: 'varchar', default: 'customer' })
  role!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToOne(() => CustomerEntity, customer => customer.user)
  customer?: CustomerEntity;

  @OneToOne(() => BusinessEntity, business => business.user)
  business?: BusinessEntity;

  // Backwards-compatible alias for earlier code that referenced `phone_number`
  get phone_number(): string | undefined {
    return this.mobile;
  }

  set phone_number(value: string | undefined) {
    this.mobile = value;
  }
}
