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
import { CustomerEntity } from './customer.entity';
import { BusinessEntity } from './business.entity';
import { BusinessServiceEntity } from './business-service.entity';

@Entity('bookings')
@Index(['customer_id'])
@Index(['business_id'])
@Index(['status'])
@Index(['created_at'])
@Index(['appointment_date'])
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid' })
  business_id!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'varchar' })
  request_type!: string;

  @Column({ type: 'date' })
  appointment_date!: Date;

  // Backwards-compatible canonical name used across services
  get scheduled_date(): Date {
    return this.appointment_date;
  }

  set scheduled_date(v: Date) {
    this.appointment_date = v;
  }

  @Column({ type: 'time', nullable: true })
  appointment_time?: string;

  @Column({ type: 'varchar', length: 255 })
  customer_name: string;

  @Column({ type: 'varchar', length: 500 })
  customer_address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone?: string;

  @Column({ type: 'uuid', nullable: true })
  service_id?: string;

  @ManyToOne(() => BusinessServiceEntity, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: BusinessServiceEntity;

  @Column({ type: 'integer', nullable: true })
  duration_hours?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_amount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  business_amount?: number;

  @Column({ type: 'timestamp', nullable: true })
  payment_due_at?: Date | null;

  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at?: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refund_amount?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at?: Date | null;

  @Column({ type: 'text' })
  problem_description: string;

  @Column({ type: 'text', nullable: true })
  business_notes?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  call_out_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => BusinessEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;

  // Semantic aliases for service compatibility (not database columns)
  get location(): string {
    return this.customer_address;
  }

  set location(value: string) {
    this.customer_address = value;
  }

  get notes(): string | undefined {
    return this.business_notes;
  }

  set notes(value: string | undefined) {
    this.business_notes = value;
  }
}
