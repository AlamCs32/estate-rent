import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { EstatesController } from './estates.controller';
import { EstatesService } from './estates.service';
import { EstatesRepository } from './estates.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstateEntity } from './entities/estate.entity';
import type { QueryEstateDto } from './dto/query-estate.dto';

const mockEstate = {
  id: '1',
  title: 'Test Estate',
  description: 'A test estate',
  price: 1000,
  location: 'Test Location',
  images: [],
  available: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EstatesController', () => {
  let controller: EstatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstatesController],
      providers: [
        EstatesService,
        EstatesRepository,
        {
          provide: getRepositoryToken(EstateEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockEstate),
            save: jest.fn().mockResolvedValue(mockEstate),
            findOne: jest.fn().mockResolvedValue(mockEstate),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn(() => ({
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockEstate], 1]),
            })),
          },
        },
      ],
    }).compile();

    controller = module.get<EstatesController>(EstatesController);
  });

  it('should return paginated estates', async () => {
    const query: QueryEstateDto = { page: 1, limit: 10 };
    const result = await controller.findAll(query);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should return a single estate', async () => {
    const estate = await controller.findOne('1');
    expect(estate.id).toBe('1');
    expect(estate.title).toBe('Test Estate');
  });
});
