import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/shared/base/base.entity';

@Entity('estates')
@Index('idx_estates_price', ['price'])
@Index('idx_estates_available', ['available'])
@Index('idx_estates_location', ['location'])
export class EstateEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ type: 'simple-array', nullable: true })
  images!: string[];

  @Column({ type: 'boolean', default: true })
  available!: boolean;
}
