import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstateEntity } from './entities/estate.entity';
import type { QueryEstateDto } from './dto/query-estate.dto';
import type { PaginatedResponse } from '@repo/types';

@Injectable()
export class EstatesRepository {
  constructor(
    @InjectRepository(EstateEntity)
    private readonly repo: Repository<EstateEntity>,
  ) {}

  async findAll(query: QueryEstateDto): Promise<PaginatedResponse<EstateEntity>> {
    const qb = this.repo.createQueryBuilder('estate');

    if (query.search) {
      qb.andWhere('estate.title ILIKE :search', { search: `%${query.search}%` });
    }
    if (query.location) {
      qb.andWhere('estate.location ILIKE :location', { location: `%${query.location}%` });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('estate.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('estate.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    const sortBy = this.sanitizeSortField(query.sortBy);
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`estate.${sortBy}`, sortOrder)
      .skip((query.page! - 1) * query.limit!)
      .take(query.limit!);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: query.page!,
      limit: query.limit!,
      totalPages: Math.ceil(total / query.limit!),
    };
  }

  async findById(id: string): Promise<EstateEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<EstateEntity>): Promise<EstateEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<EstateEntity>): Promise<EstateEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private sanitizeSortField(field?: string): string {
    const allowed = ['createdAt', 'updatedAt', 'price', 'title', 'location'];
    if (field && allowed.includes(field)) {
      return field;
    }
    return 'createdAt';
  }
}
