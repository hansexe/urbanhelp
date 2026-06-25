import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('customers')
@Index(['suburb'])
@Index(['postcode'])
@Index(['state'])
export class CustomerEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  suburb!: string;

  @Column({ type: 'varchar', length: 10 })
  postcode!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: false })
  phone_verified!: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified!: boolean;

  @Column({ type: 'varchar', default: 'sms' })
  preferred_contact_method!: string;

  @Column({ type: 'jsonb', nullable: true })
  saved_addresses?: any[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, nullable: true })
  average_rating?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToOne(() => UserEntity, user => user.customer)
  @JoinColumn()
  user: UserEntity;
}
