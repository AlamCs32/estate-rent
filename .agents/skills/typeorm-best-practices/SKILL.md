---
name: typeorm-best-practices
description: TypeORM best practices for NestJS + PostgreSQL. Use when writing entities, repositories, migrations, query builders, or solving N+1 issues. Covers entity design, custom repositories, transactions, and performance optimization.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# TypeORM Best Practices — EstateRent

Comprehensive guide for using TypeORM with NestJS and PostgreSQL in the EstateRent monorepo.

## When to Apply

- Writing or reviewing entity definitions
- Building custom repositories
- Authoring or running migrations
- Fixing N+1 query problems
- Writing `QueryBuilder` queries
- Implementing transaction logic
- Indexing strategy decisions

---

## 1. Entity Design

### Rules

- Use `@Entity()` with an explicit table name in **snake_case** (e.g., `@Entity('estate_listings')`).
- Prefer `uuid` primary keys generated with `@PrimaryGeneratedColumn('uuid')`.
- Always define `@CreateDateColumn()` and `@UpdateDateColumn()` on every entity.
- Use `@DeleteDateColumn()` for soft-deletes instead of a boolean `isDeleted` flag.
- Define relation eager-loading only for tiny reference tables; default to lazy / explicit joins.
- Use `@Index()` decorator on columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses.
- Use `@Column({ type: 'enum', enum: BookingStatus })` for enum columns, **not** `varchar`.
- Store monetary values as `numeric(12, 2)`, never `float`.

### Good Example

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingStatus } from '@repo/types';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  estateId: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string; // store as string, parse with parseFloat when needed

  @Column({ type: 'date' })
  checkIn: string;

  @Column({ type: 'date' })
  checkOut: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

---

## 2. Repository Pattern

### Rules

- **Never inject `DataSource` or `Repository<E>` directly into controllers**.
- Create a custom repository class that extends `Repository<E>` or wraps `DataSource.getRepository()`.
- Register custom repositories as providers with `provide: REPO_TOKEN` pattern.
- Services import the **custom repo**, not the generic TypeORM one.

### Custom Repository Pattern

```typescript
// bookings.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BookingEntity } from './booking.entity';

@Injectable()
export class BookingsRepository extends Repository<BookingEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(BookingEntity, dataSource.createEntityManager());
  }

  async findActiveByTenant(tenantId: string): Promise<BookingEntity[]> {
    return this.createQueryBuilder('booking')
      .where('booking.tenantId = :tenantId', { tenantId })
      .andWhere('booking.deletedAt IS NULL')
      .orderBy('booking.createdAt', 'DESC')
      .getMany();
  }
}

// bookings.module.ts — register as provider
@Module({
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsRepository],
})
export class BookingsModule {}
```

---

## 3. Avoiding N+1 Queries

### Rules

- Never access a relation property inside a loop without joining it first.
- Use `leftJoinAndSelect` or `relations` array option to pre-load relations.
- Use `QueryBuilder` with `.select()` to fetch only needed columns on large tables.

### Bad

```typescript
const bookings = await this.repo.find(); // no relations
for (const b of bookings) {
  console.log(b.estate.title); // ❌ triggers N separate queries
}
```

### Good

```typescript
const bookings = await this.repo.find({
  relations: { estate: true }, // ✅ single JOIN query
});
// or with QueryBuilder for column selection:
const bookings = await this.repo
  .createQueryBuilder('b')
  .leftJoinAndSelect('b.estate', 'e')
  .select(['b.id', 'b.status', 'e.title', 'e.pricePerMonth'])
  .where('b.tenantId = :tenantId', { tenantId })
  .getMany();
```

---

## 4. Transactions

### Rules

- Use `DataSource.transaction()` for multi-step writes that must be atomic.
- Never catch errors inside a transaction callback — let them propagate so TypeORM rolls back.
- Use `QueryRunner` only when you need fine-grained control (e.g., savepoints).

```typescript
async confirmBooking(bookingId: string): Promise<void> {
  await this.dataSource.transaction(async (manager) => {
    const booking = await manager.findOneOrFail(BookingEntity, {
      where: { id: bookingId },
      lock: { mode: 'pessimistic_write' },
    });
    booking.status = BookingStatus.CONFIRMED;
    await manager.save(booking);

    const ledger = manager.create(LedgerEntity, {
      bookingId: booking.id,
      amount: booking.totalAmount,
    });
    await manager.save(ledger);
  });
}
```

---

## 5. Migrations

### Rules

- **Never use `synchronize: true` in production**. Set it to `false` in `TypeOrmModuleOptions`.
- Always generate migrations with `pnpm --filter @repo/api migration:generate --name <Name>`.
- Migrations live in `apps/api/src/database/migrations/`.
- Every migration must be reversible — implement `down()` properly.
- Review generated migration SQL before running it.

```typescript
// Example migration
export class AddPriceIndexToEstates1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_estates_price_per_month" ON "estates" ("pricePerMonth")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_estates_price_per_month"`);
  }
}
```

---

## 6. Query Performance

| Technique                 | When to Use                                           |
| ------------------------- | ----------------------------------------------------- |
| `select` specific columns | Large tables, avoid over-fetching                     |
| `take` + `skip`           | Pagination — always paginate list queries             |
| `@Index()` decorator      | Columns in WHERE / ORDER / JOIN                       |
| `QueryBuilder`            | Complex conditions, aggregates, subqueries            |
| `stream()`                | Large exports — avoids loading everything into memory |
| `EXPLAIN ANALYZE`         | Profile slow queries in dev                           |

---

## 7. Soft Deletes

Use `@DeleteDateColumn()` + `withDeleted()` pattern:

```typescript
// Find only non-deleted
await this.repo.find(); // automatically excludes soft-deleted rows

// Find including deleted
await this.repo.find({ withDeleted: true });

// Soft delete
await this.repo.softDelete(id);

// Hard delete (only if explicitly needed)
await this.repo.delete(id);
```

---

## 8. TypeORM + NestJS Config

```typescript
// database.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    database: config.get('DB_NAME'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    synchronize: false, // ❌ never true in production
    logging: config.get('NODE_ENV') === 'development',
    ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  }),
});
```
