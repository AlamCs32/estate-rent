import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstatesService } from './estates.service';
import { EstatesRepository } from './estates.repository';
import { EstateEntity } from './entities/estate.entity';
import type { QueryEstateDto } from './dto/query-estate.dto';
import type { CreateEstateDto } from './dto/create-estate.dto';

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

describe('EstatesService', () => {
  let service: EstatesService;
  let repository: EstatesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<EstatesService>(EstatesService);
    repository = module.get<EstatesRepository>(EstatesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated estates', async () => {
    const query: QueryEstateDto = { page: 1, limit: 10 };
    const result = await service.findAll(query);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find an estate by id', async () => {
    const estate = await service.findOne('1');
    expect(estate).toBeDefined();
    expect(estate.id).toBe('1');
  });

  it('should throw on missing estate', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);
    await expect(service.findOne('999')).rejects.toThrow('not found');
  });

  it('should create an estate', async () => {
    const dto: CreateEstateDto = {
      title: 'New Estate',
      description: 'Description',
      price: 1500,
      location: 'Location',
    };
    const result = await service.create(dto);
    expect(result.id).toBe('1');
  });
});
