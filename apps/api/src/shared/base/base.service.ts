import { NotFoundException } from '@nestjs/common';
import type { FindOptionsWhere } from 'typeorm';
import type { Repository } from 'typeorm';
import type { BaseEntity } from './base.entity';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T> {
    const where = { id } as unknown as FindOptionsWhere<T>;
    const entity = await this.repository.findOne({ where });
    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} with id "${id}" not found`);
    }
    return entity;
  }

  async exists(id: string): Promise<boolean> {
    const where = { id } as unknown as FindOptionsWhere<T>;
    const count = await this.repository.count({ where });
    return count > 0;
  }

  protected abstract getEntityName(): string;
}
