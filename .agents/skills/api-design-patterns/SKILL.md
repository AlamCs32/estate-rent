---
name: api-design-patterns
description: REST API design patterns for NestJS controllers. Use when designing endpoints, structuring API responses, implementing pagination, versioning, Swagger docs, or building the ApiResponse<T> envelope. Follows EstateRent conventions for consistent, predictable APIs.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# API Design Patterns — EstateRent

Conventions for building consistent, well-documented REST APIs in the NestJS backend.

## When to Apply

- Creating new controllers or route handlers
- Designing request/response DTOs
- Implementing pagination for list endpoints
- Adding Swagger/OpenAPI documentation
- Structuring error responses
- Implementing API versioning

---

## 1. Response Envelope

All API responses **must** use the `ApiResponse<T>` envelope from `@repo/types`.

```typescript
// packages/types/src/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
```

---

## 2. Controller Structure

```typescript
// estates.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { ApiResponse, PaginatedResponse } from '@repo/types';
import { EstatesService } from './estates.service';
import { CreateEstateDto, UpdateEstateDto, EstateQueryDto } from './dto';

@ApiTags('estates')
@Controller({ path: 'estates', version: '1' })
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Get()
  @ApiOperation({ summary: 'List estates with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated list of estates' })
  async findAll(@Query() query: EstateQueryDto): Promise<PaginatedResponse<EstateDto>> {
    return this.estatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single estate by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<EstateDto>> {
    const estate = await this.estatesService.findOne(id);
    return { success: true, data: estate };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new estate listing' })
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateEstateDto,
  ): Promise<ApiResponse<EstateDto>> {
    const estate = await this.estatesService.create(user.id, dto);
    return { success: true, data: estate, message: 'Estate created successfully' };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateEstateDto,
  ): Promise<ApiResponse<EstateDto>> {
    const estate = await this.estatesService.update(id, user.id, dto);
    return { success: true, data: estate };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.estatesService.remove(id, user.id);
  }
}
```

---

## 3. Query DTO (Pagination + Filters)

```typescript
// dto/estate-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EstateQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 12;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: EstateStatus })
  @IsOptional()
  @IsEnum(EstateStatus)
  status?: EstateStatus;
}
```

---

## 4. Pagination in Service

```typescript
// estates.service.ts
async findAll(query: EstateQueryDto): Promise<PaginatedResponse<EstateDto>> {
  const { page, limit, city, minPrice, maxPrice, status } = query;

  const qb = this.estatesRepo
    .createQueryBuilder('estate')
    .where('estate.deletedAt IS NULL');

  if (city) qb.andWhere('estate.city ILIKE :city', { city: `%${city}%` });
  if (status) qb.andWhere('estate.status = :status', { status });
  if (minPrice !== undefined) qb.andWhere('estate.pricePerMonth >= :min', { min: minPrice });
  if (maxPrice !== undefined) qb.andWhere('estate.pricePerMonth <= :max', { max: maxPrice });

  const [data, total] = await qb
    .orderBy('estate.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    success: true,
    data: data.map((e) => this.toDto(e)),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 5. Global Exception Filter

```typescript
// common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiResponse } from '@repo/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : (((body as Record<string, unknown>).message as string) ?? message);
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    const body: ApiResponse<null> = { success: false, data: null, message };
    response.status(status).send(body);
  }
}

// Register globally in main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## 6. API Versioning Setup

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

app.enableVersioning({ type: VersioningType.URI }); // /api/v1/estates
```

Each controller uses `@Controller({ path: 'estates', version: '1' })`.

---

## 7. Swagger Setup

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('EstateRent API')
  .setDescription('Real estate rental platform API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

## 8. HTTP Status Code Conventions

| Situation                | Status Code                 |
| ------------------------ | --------------------------- |
| Successful GET / PATCH   | `200 OK`                    |
| Successful POST (create) | `201 Created`               |
| Successful DELETE        | `204 No Content`            |
| Validation failure       | `400 Bad Request`           |
| Unauthenticated          | `401 Unauthorized`          |
| Insufficient permissions | `403 Forbidden`             |
| Resource not found       | `404 Not Found`             |
| Conflict (duplicate)     | `409 Conflict`              |
| Rate limited             | `429 Too Many Requests`     |
| Server error             | `500 Internal Server Error` |

---

## 9. DTO Design Rules

- All input DTOs use `class-validator` decorators + `ValidationPipe` globally.
- All DTOs have corresponding `@ApiProperty()` Swagger annotations.
- Response DTOs use `@Exclude()` to prevent leaking sensitive fields (e.g., `passwordHash`).
- Use `@Type(() => Number)` for numeric query params (they arrive as strings).
- Use `@IsUUID()` for all ID params.

```typescript
// main.ts — global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true, // auto-transform to DTO types
    transformOptions: { enableImplicitConversion: true },
  }),
);
```
