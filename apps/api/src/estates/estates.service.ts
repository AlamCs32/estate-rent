import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResponse } from '@repo/types';
import { EstatesRepository } from './estates.repository';
import { EstateEntity } from './entities/estate.entity';
import type { CreateEstateDto } from './dto/create-estate.dto';
import type { UpdateEstateDto } from './dto/update-estate.dto';
import type { QueryEstateDto } from './dto/query-estate.dto';

@Injectable()
export class EstatesService {
  constructor(private readonly estatesRepository: EstatesRepository) {}

  async findAll(query: QueryEstateDto): Promise<PaginatedResponse<EstateEntity>> {
    return this.estatesRepository.findAll(query);
  }

  async findOne(id: string): Promise<EstateEntity> {
    const estate = await this.estatesRepository.findById(id);
    if (!estate) {
      throw new NotFoundException(`Estate with id "${id}" not found`);
    }
    return estate;
  }

  async create(dto: CreateEstateDto): Promise<EstateEntity> {
    return this.estatesRepository.create(dto as Partial<EstateEntity>);
  }

  async update(id: string, dto: UpdateEstateDto): Promise<EstateEntity> {
    const estate = await this.estatesRepository.update(id, dto as Partial<EstateEntity>);
    if (!estate) {
      throw new NotFoundException(`Estate with id "${id}" not found`);
    }
    return estate;
  }

  async delete(id: string): Promise<void> {
    const estate = await this.estatesRepository.findById(id);
    if (!estate) {
      throw new NotFoundException(`Estate with id "${id}" not found`);
    }
    await this.estatesRepository.delete(id);
  }
}
