# API Guidelines — EstateRent Monorepo

## Design Principles

- **RESTful conventions.** Resources, not RPC. Nouns, not verbs.
- **Consistent responses.** All responses use `ApiResponse<T>` wrapper.
- **Semantic HTTP status codes.** 200 success, 201 created, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 server error.
- **Versioned.** All endpoints under `/api/v1` prefix (future-proofing).
- **Stateless.** No server-side sessions. JWT tokens carry identity.

## Endpoint Conventions

| Method | Endpoint           | Action                   |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/estates`     | List estates (paginated) |
| GET    | `/api/estates/:id` | Get estate details       |
| POST   | `/api/estates`     | Create estate            |
| PATCH  | `/api/estates/:id` | Update estate            |
| DELETE | `/api/estates/:id` | Delete estate            |
| GET    | `/api/health`      | Health check             |

## Response Format

### Success (Single)

```json
{
  "data": { ... },
  "message": "Estate created successfully"
}
```

### Success (List)

```json
{
  "data": [ ... ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Error

```json
{
  "data": null,
  "error": "Estate not found",
  "message": "Estate with id 'abc' not found"
}
```

## HTTP Status Codes

| Code | Usage                             |
| ---- | --------------------------------- |
| 200  | Successful GET, PATCH             |
| 201  | Successful POST (created)         |
| 204  | Successful DELETE (no content)    |
| 400  | Validation error, bad request     |
| 401  | Missing or invalid authentication |
| 403  | Authenticated but not authorized  |
| 404  | Resource not found                |
| 409  | Conflict (e.g., duplicate)        |
| 422  | Unprocessable entity              |
| 429  | Rate limit exceeded               |
| 500  | Internal server error             |

## NestJS Controller Rules

```typescript
@Controller('estates')
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Get()
  @ApiOkResponse({ type: PaginatedResponseDto })
  async findAll(@Query() query: QueryEstatesDto): Promise<PaginatedResponse<Estate>> {
    return this.estatesService.findAll(query);
  }

  @Post()
  @ApiCreatedResponse({ type: EstateResponseDto })
  async create(@Body() dto: CreateEstateDto): Promise<ApiResponse<Estate>> {
    return this.estatesService.create(dto);
  }
}
```

## DTO Validation

Use `class-validator` decorators on all DTOs:

```typescript
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateEstateDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
```

## Pagination

All list endpoints accept pagination query parameters:

| Parameter   | Type          | Default     | Description              |
| ----------- | ------------- | ----------- | ------------------------ |
| `page`      | number        | 1           | Page number (1-indexed)  |
| `limit`     | number        | 10          | Items per page (max 100) |
| `sortBy`    | string        | `createdAt` | Sort field               |
| `sortOrder` | `asc`\|`desc` | `desc`      | Sort direction           |

## Error Handling

- Use NestJS built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.).
- Custom exception filter catches all unhandled exceptions and returns consistent format.
- Validation errors from `ValidationPipe` are returned as `400 BadRequestException`.
- Business logic errors belong in services, thrown as typed exceptions.

## API Documentation

- Use `@nestjs/swagger` with decorators for OpenAPI generation.
- Enable Swagger UI in non-production environments only.
- Include response schemas, request DTOs, and enums in OpenAPI spec.

## Middleware Order

1. Helmet (security headers)
2. CORS
3. Request logging
4. Rate limiting
5. Authentication (JWT validation)
6. Validation pipe (body/query/param validation)
7. Controller
