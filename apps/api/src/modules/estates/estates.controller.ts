import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EstatesService } from './estates.service';
import type { EstateEntity } from './entities/estate.entity';
import type { CreateEstateDto } from './dto/create-estate.dto';
import type { UpdateEstateDto } from './dto/update-estate.dto';
import type { QueryEstateDto } from './dto/query-estate.dto';
import type { PaginatedResponse } from '@repo/types';

@Controller('estates')
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Get()
  async findAll(@Query() query: QueryEstateDto): Promise<PaginatedResponse<EstateEntity>> {
    return this.estatesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EstateEntity> {
    return this.estatesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateEstateDto): Promise<EstateEntity> {
    return this.estatesService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEstateDto): Promise<EstateEntity> {
    return this.estatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.estatesService.delete(id);
  }
}
