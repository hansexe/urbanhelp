import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessEntity } from './business.entity';
import { CustomerEntity } from './customer.entity';

@Entity('reviews')
@Index(['business_id'])
@Index(['customer_id'])
@Index(['created_at'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  booking_id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid' })
  business_id!: string;

  @Column({ type: 'integer' })
  rating!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: true })
  is_verified!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @ManyToOne(() => BusinessEntity)
  @JoinColumn({ name: 'business_id' })
  business?: BusinessEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer?: CustomerEntity;
}
