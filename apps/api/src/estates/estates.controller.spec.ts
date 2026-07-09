import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { EstatesController } from './estates.controller';
import { EstatesService } from './estates.service';

describe('EstatesController', () => {
  let controller: EstatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstatesController],
      providers: [EstatesService],
    }).compile();

    controller = module.get<EstatesController>(EstatesController);
  });

  it('should return paginated estates', () => {
    const result = controller.findAll('1', '10');
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should return a single estate', () => {
    const estate = controller.findOne('1');
    expect(estate.id).toBe('1');
    expect(estate.title).toBe('Modern Downtown Apartment');
  });
});
