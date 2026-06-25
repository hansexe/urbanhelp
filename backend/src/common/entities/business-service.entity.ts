import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BusinessEntity } from './business.entity';

@Entity('business_services')
@Index(['business_id'])
@Index(['service_type'])
export class BusinessServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  business_id!: string;

  @Column({ type: 'varchar', length: 100 })
  service_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  business_hours_fee!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  out_of_hours_fee?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @ManyToOne(() => BusinessEntity, business => business.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessEntity;

  // Compatibility aliases
  get service_name(): string {
    return this.service_type;
  }

  set service_name(v: string) {
    this.service_type = v;
  }

  get hourly_rate(): number {
    return Number(this.business_hours_fee);
  }

  set hourly_rate(v: number) {
    this.business_hours_fee = v;
  }
}
