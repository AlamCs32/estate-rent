import { Controller, Get, Param, Query } from '@nestjs/common';
import { EstatesService } from './estates.service';
import type { Estate } from '@repo/types';

@Controller('estates')
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.estatesService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Estate {
    return this.estatesService.findOne(id);
  }
}
