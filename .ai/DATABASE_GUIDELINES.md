# Database Guidelines — EstateRent Monorepo

## Configuration

- Database URL is set via `DATABASE_URL` environment variable (configured in `@repo/config`).
- TypeORM configured via `TypeOrmModule.forRootAsync()` in `AppModule`.
- `synchronize: false` in all environments except local dev.
- Use migrations for all schema changes.

## Entity Definitions

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estates')
export class EstateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### Naming Conventions

| Element            | Convention             | Example                     |
| ------------------ | ---------------------- | --------------------------- |
| Tables             | snake_case, plural     | `estates`, `user_bookmarks` |
| Columns            | snake_case             | `first_name`, `created_at`  |
| Primary keys       | `id` (uuid)            | `id`                        |
| Foreign keys       | `<table>_id`           | `estate_id`, `user_id`      |
| Join tables        | `table1_table2`        | `users_roles`               |
| Indexes            | `idx_<table>_<column>` | `idx_estates_price`         |
| Unique constraints | `uq_<table>_<column>`  | `uq_users_email`            |

## Relationships

```typescript
// Many-to-One
@ManyToOne(() => UserEntity, (user) => user.estates)
@JoinColumn({ name: 'owner_id' })
owner!: UserEntity;

// One-to-Many
@OneToMany(() => BookingEntity, (booking) => booking.estate)
bookings!: BookingEntity[];

// Many-to-Many
@ManyToMany(() => AmenityEntity)
@JoinTable({
  name: 'estate_amenities',
  joinColumn: { name: 'estate_id' },
  inverseJoinColumn: { name: 'amenity_id' },
})
amenities!: AmenityEntity[];
```

## Migrations

```bash
# Create a migration
pnpm --filter @repo/api typeorm migration:create ./src/migrations/CreateEstatesTable

# Run migrations
pnpm --filter @repo/api typeorm migration:run

# Revert last migration
pnpm --filter @repo/api typeorm migration:revert
```

Migration files are stored in `apps/api/src/migrations/` and use the format `TIMESTAMP-Name.ts`.

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEstatesTable1234567890123 implements MigrationInterface {
  name = 'CreateEstatesTable1234567890123';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'estates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('estates');
  }
}
```

## Query Patterns

### Repository Pattern (Preferred)

```typescript
@Injectable()
export class EstatesRepository {
  constructor(
    @InjectRepository(EstateEntity)
    private readonly repo: Repository<EstateEntity>,
  ) {}

  async findAll(query: QueryEstatesDto): Promise<PaginatedResponse<EstateEntity>> {
    const [data, total] = await this.repo.findAndCount({
      where: { available: true },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['owner', 'images'],
    });

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
```

### Query Builder (For complex queries)

```typescript
async search(filters: SearchEstatesDto): Promise<EstateEntity[]> {
  const qb = this.repo.createQueryBuilder('estate')
    .leftJoinAndSelect('estate.owner', 'owner')
    .where('estate.available = :available', { available: true });

  if (filters.minPrice) {
    qb.andWhere('estate.price >= :minPrice', { minPrice: filters.minPrice });
  }

  if (filters.maxPrice) {
    qb.andWhere('estate.price <= :maxPrice', { maxPrice: filters.maxPrice });
  }

  if (filters.location) {
    qb.andWhere('estate.location ILIKE :location', { location: `%${filters.location}%` });
  }

  return qb
    .orderBy('estate.createdAt', 'DESC')
    .skip((filters.page - 1) * filters.limit)
    .take(filters.limit)
    .getMany();
}
```

## Indexing Strategy

Create indexes for:

- Foreign key columns (`owner_id`, `estate_id`)
- Columns used in `WHERE` clauses (`available`, `price`, `location`)
- Columns used in `ORDER BY` (`created_at`, `price`)
- Columns used in text search (GIN index for ILIKE/tsvector)

## Migrations vs Synchronize

| Environment | `synchronize`     | Migrations    |
| ----------- | ----------------- | ------------- |
| Local dev   | `true` (optional) | Manual run    |
| CI/Test     | `true`            | Not needed    |
| Staging     | `false`           | Run on deploy |
| Production  | `false`           | Run on deploy |

## Seeding

Create seed scripts in `apps/api/src/seeds/`:

```typescript
// apps/api/src/seeds/estates.seed.ts
import { DataSource } from 'typeorm';
import { EstateEntity } from '../estates/entities/estate.entity';

export async function seedEstates(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(EstateEntity);
  const estates = [
    { title: 'Modern Downtown Apartment', price: 2500, available: true },
    { title: 'Beachfront Villa', price: 5000, available: true },
  ];
  await repo.save(estates);
}
```
