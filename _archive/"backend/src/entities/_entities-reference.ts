// backend/src/common/entities/user.entity.ts
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
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  mobile?: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', default: 'customer' })
  role: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => CustomerEntity, customer => customer.user)
  customer?: CustomerEntity;

  @OneToOne(() => BusinessEntity, business => business.user)
  business?: BusinessEntity;
}

// backend/src/common/entities/customer.entity.ts
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
  id: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  suburb: string;

  @Column({ type: 'varchar', length: 10 })
  postcode: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'varchar', default: 'sms' })
  preferred_contact_method: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => UserEntity, user => user.customer)
  @JoinColumn()
  user: UserEntity;
}

// backend/src/common/entities/business.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BusinessServiceEntity } from './business-service.entity';
import { BusinessHoursEntity } from './business-hours.entity';
import { BusinessImageEntity } from './business-image.entity';

@Entity('businesses')
@Index(['suburb'])
@Index(['postcode'])
@Index(['is_approved'])
@Index(['is_suspended'])
@Index(['created_at'])
export class BusinessEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  abn: string;

  @Column({ type: 'varchar', length: 255 })
  owner_name: string;

  @Column({ type: 'varchar', length: 255 })
  business_email: string;

  @Column({ type: 'varchar', length: 20 })
  business_mobile: string;

  @Column({ type: 'varchar', length: 500 })
  business_address: string;

  @Column({ type: 'varchar', length: 100 })
  suburb: string;

  @Column({ type: 'varchar', length: 10 })
  postcode: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'integer', default: 25 })
  service_radius: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website_url?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  experience?: string;

  @Column({ type: 'text', nullable: true })
  qualifications?: string;

  @Column({ type: 'text', nullable: true })
  licences?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  avg_rating: number;

  @Column({ type: 'integer', default: 0 })
  total_reviews: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column({ type: 'varchar', default: 'pending' })
  approval_status: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'boolean', default: false })
  is_suspended: boolean;

  @Column({ type: 'text', nullable: true })
  suspension_reason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => UserEntity, user => user.business)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => BusinessServiceEntity, service => service.business)
  services: BusinessServiceEntity[];

  @OneToMany(() => BusinessHoursEntity, hours => hours.business)
  business_hours: BusinessHoursEntity[];

  @OneToMany(() => BusinessImageEntity, image => image.business)
  images: BusinessImageEntity[];
}

// backend/src/common/entities/business-service.entity.ts
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
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', length: 100 })
  service_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  business_hours_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  out_of_hours_fee: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => BusinessEntity, business => business.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}

// backend/src/common/entities/business-hours.entity.ts
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

@Entity('business_hours')
@Index(['business_id'])
export class BusinessHoursEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'integer' })
  day_of_week: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => BusinessEntity, business => business.business_hours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}

// backend/src/common/entities/business-image.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BusinessEntity } from './business.entity';

@Entity('business_images')
@Index(['business_id'])
export class BusinessImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', length: 500 })
  image_url: string;

  @Column({ type: 'varchar', length: 500 })
  s3_key: string;

  @Column({ type: 'integer' })
  display_order: number;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => BusinessEntity, business => business.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}

// backend/src/common/entities/booking.entity.ts
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

@Entity('bookings')
@Index(['customer_id'])
@Index(['business_id'])
@Index(['status'])
@Index(['created_at'])
@Index(['appointment_date'])
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar' })
  request_type: string;

  @Column({ type: 'date' })
  appointment_date: Date;

  @Column({ type: 'time', nullable: true })
  appointment_time?: string;

  @Column({ type: 'varchar', length: 255 })
  customer_name: string;

  @Column({ type: 'varchar', length: 500 })
  customer_address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone?: string;

  @Column({ type: 'text' })
  problem_description: string;

  @Column({ type: 'text', nullable: true })
  business_notes?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  call_out_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

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
}

// backend/src/common/entities/payment.entity.ts
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
  id: string;

  @Column({ type: 'uuid', unique: true })
  booking_id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payout_amount: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_payment_intent_id?: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_charge_id?: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_connect_account_id?: string;

  @Column({ type: 'varchar', default: 'pending' })
  payout_status: string;

  @Column({ type: 'timestamp', nullable: true })
  payout_date?: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;
}

// backend/src/common/entities/review.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('reviews')
@Index(['business_id'])
@Index(['customer_id'])
@Index(['created_at'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  booking_id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: true })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

// backend/src/common/entities/notification.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
@Index(['recipient_id'])
@Index(['status'])
@Index(['created_at'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  recipient_id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  opened_at?: Date;

  @Column({ type: 'varchar', nullable: true })
  external_id?: string;

  @Column({ type: 'text', nullable: true })
  failure_reason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

// backend/src/common/entities/otp-code.entity.ts
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
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
