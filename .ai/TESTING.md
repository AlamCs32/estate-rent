# Testing Guidelines — EstateRent Monorepo

## Testing Philosophy

- **Test behavior, not implementation.** Tests should verify outcomes, not internal details.
- **Write tests alongside code.** Every new feature includes unit tests for services and components.
- **Test the public API.** Mock dependencies, test the public methods.
- **Avoid testing frameworks internals.** Don't test that NestJS DI works — test that your service returns correct data.

## Test Structure

### Unit Tests (`*.spec.ts`)

Unit tests cover individual classes in isolation.

```
apps/api/src/
  app.controller.spec.ts
  app.service.spec.ts
  health/health.controller.spec.ts
  estates/estates.controller.spec.ts
  estates/estates.service.spec.ts
```

### Integration Tests (`*.e2e-spec.ts`)

E2E tests cover full HTTP endpoints with real database.

```
apps/api/test/
  app.e2e-spec.ts
  estates.e2e-spec.ts
```

### Frontend Tests (`*.test.tsx`)

Component and hook tests for React.

```
apps/web/src/
  app.test.tsx
  estates/__tests__/
    estate-card.test.tsx
    use-estates.test.ts
```

## Running Tests

```bash
pnpm test                          # All unit tests across monorepo
pnpm test --filter @repo/api       # API unit tests only
pnpm test --filter @repo/web       # Web tests only
pnpm --filter @repo/api test:e2e  # API e2e tests
```

## API Testing Patterns

### Service Tests

```typescript
describe('EstatesService', () => {
  let service: EstatesService;
  let repository: MockType<Repository<Estate>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstatesService,
        {
          provide: getRepositoryToken(Estate),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EstatesService);
    repository = module.get(getRepositoryToken(Estate));
  });

  it('should return paginated results', async () => {
    repository.find.mockResolvedValue([mockEstate]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
  });
});
```

### Controller Tests

```typescript
describe('EstatesController', () => {
  let controller: EstatesController;
  let service: EstatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstatesController],
      providers: [
        {
          provide: EstatesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(EstatesController);
    service = module.get(EstatesService);
  });

  it('should call service.findAll with correct params', () => {
    controller.findAll('1', '10');
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
```

### E2E Tests

```typescript
describe('Estates (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /api/estates', () => {
    return request(app.getHttpServer())
      .get('/api/estates')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });
});
```

## Frontend Testing Patterns

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { EstateCard } from './estate-card';

describe('EstateCard', () => {
  const mockEstate = { id: '1', title: 'Test', price: 1000 };

  it('renders estate title', () => {
    render(<EstateCard estate={mockEstate} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useEstates } from './use-estates';

describe('useEstates', () => {
  it('returns estates on success', async () => {
    const { result } = renderHook(() => useEstates());
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});
```

## Coverage Goals

| Area        | Minimum Coverage |
| ----------- | ---------------- |
| Services    | 90%              |
| Controllers | 85%              |
| Components  | 80%              |
| Hooks       | 85%              |
| Utils       | 95%              |
| Overall     | 85%              |

## Mocking Strategy

- Use `jest.fn()` or `vi.fn()` for simple mocks.
- Use `Test.createTestingModule` for NestJS DI mocks.
- Use `MockType<T>` utility for repository mocks.
- Prefer `userEvent` over `fireEvent` for React component tests.
- Mock HTTP requests at the network boundary (MSW) rather than in components.
