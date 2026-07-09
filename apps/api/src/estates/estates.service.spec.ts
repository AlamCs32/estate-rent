import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { EstatesService } from './estates.service';

describe('EstatesService', () => {
  let service: EstatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstatesService],
    }).compile();

    service = module.get<EstatesService>(EstatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all estates paginated', () => {
    const result = service.findAll(1, 10);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should find an estate by id', () => {
    const estate = service.findOne('1');
    expect(estate).toBeDefined();
    expect(estate.id).toBe('1');
  });
});
