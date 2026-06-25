import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payments')
@Index(['booking_id'])
@Index(['customer_id'])
@Index(['business_id'])
@Index(['status'])
@Index(['created_at'])
@Index(['stripe_charge_id'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  booking_id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid' })
  business_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payout_amount!: number;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_payment_intent_id?: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_charge_id?: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_connect_account_id?: string;

  @Column({ type: 'varchar', default: 'pending' })
  payout_status!: string;

  @Column({ type: 'timestamp', nullable: true })
  payout_date?: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  // Payment tracking fields
  @Column({ type: 'varchar', default: 'charge', nullable: true })
  payment_type?: string;

  @Column({ type: 'timestamp', nullable: true })
  succeeded_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  failed_at?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'varchar', nullable: true })
  transfer_id?: string;

  // Computed alias for unified Stripe ID access
  get stripe_payment_id(): string | undefined {
    return this.stripe_payment_intent_id || this.stripe_charge_id;
  }

  set stripe_payment_id(value: string | undefined) {
    if (value) {
      if (value.startsWith('pi_')) {
        this.stripe_payment_intent_id = value;
      } else {
        this.stripe_charge_id = value;
      }
    }
  }
}
