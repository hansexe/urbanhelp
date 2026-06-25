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
  id!: string;

  @Column({ type: 'uuid' })
  business_id!: string;

  @Column({ type: 'varchar', length: 500 })
  image_url!: string;

  @Column({ type: 'varchar', length: 500 })
  s3_key!: string;

  @Column({ type: 'integer' })
  display_order!: number;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @ManyToOne(() => BusinessEntity, business => business.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessEntity;
}
