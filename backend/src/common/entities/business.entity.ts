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
import { BusinessBankingDetailsEntity } from './business-banking-details.entity';

@Entity('businesses')
@Index(['suburb'])
@Index(['postcode'])
@Index(['is_approved'])
@Index(['is_suspended'])
@Index(['created_at'])
export class BusinessEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  abn!: string;

  @Column({ type: 'varchar', length: 255 })
  owner_name!: string;

  @Column({ type: 'varchar', length: 255 })
  business_email!: string;

  @Column({ type: 'varchar', length: 20 })
  business_mobile!: string;

  @Column({ type: 'varchar', length: 500 })
  business_address!: string;

  @Column({ type: 'varchar', length: 100 })
  suburb!: string;

  @Column({ type: 'varchar', length: 10 })
  postcode!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'integer', default: 25 })
  service_radius!: number;

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
  avg_rating!: number;

  @Column({ type: 'integer', default: 0 })
  total_reviews!: number;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'boolean', default: false })
  is_approved!: boolean;

  @Column({ type: 'varchar', default: 'pending' })
  approval_status!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'boolean', default: false })
  is_suspended!: boolean;

  @Column({ type: 'text', nullable: true })
  suspension_reason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Stripe Connect status - tracks account capabilities
  @Column({ type: 'boolean', default: false, nullable: true })
  stripe_charges_enabled?: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  stripe_payouts_enabled?: boolean;

  @Column({ type: 'varchar', nullable: true })
  stripe_connect_account_id?: string;

  // Approval workflow timestamps
  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'text', nullable: true })
  approval_notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToOne(() => UserEntity, user => user.business)
  @JoinColumn()
  user!: UserEntity;

  @OneToMany(() => BusinessServiceEntity, service => service.business)
  services!: BusinessServiceEntity[];

  @OneToMany(() => BusinessHoursEntity, hours => hours.business)
  business_hours!: BusinessHoursEntity[];

  @OneToMany(() => BusinessImageEntity, image => image.business)
  images!: BusinessImageEntity[];

  @OneToMany(() => BusinessBankingDetailsEntity, details => details.business)
  banking_details!: BusinessBankingDetailsEntity[];

  // Backwards-compatible aliases / computed properties
  get service_radius_km(): number {
    return this.service_radius;
  }

  set service_radius_km(v: number) {
    this.service_radius = v;
  }

  get website(): string | undefined {
    return this.website_url;
  }

  set website(v: string | undefined) {
    this.website_url = v;
  }

  get hours(): BusinessHoursEntity[] {
    return this.business_hours;
  }

  set hours(v: BusinessHoursEntity[]) {
    this.business_hours = v;
  }

  get average_rating(): number {
    return this.avg_rating;
  }

  set average_rating(v: number) {
    this.avg_rating = v;
  }
}
