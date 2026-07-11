---
name: nestjs-auth-jwt
description: JWT authentication and authorization patterns for NestJS + Fastify. Use when implementing login, registration, JWT issuance and validation, Guards, refresh tokens, or role-based access control (RBAC) in the EstateRent API.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# NestJS Authentication & Authorization — EstateRent

Complete JWT authentication implementation guide for the NestJS + Fastify backend.

## When to Apply

- Implementing login, registration, or OAuth endpoints
- Writing `AuthGuard`, `RolesGuard`, or custom guards
- Issuing or validating JWTs
- Implementing refresh token rotation
- Protecting endpoints with `@UseGuards()` and `@Roles()`
- Hashing passwords with bcrypt

---

## 1. Package Setup

```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt --filter @repo/api
pnpm add -D @types/passport-jwt @types/bcrypt --filter @repo/api
```

---

## 2. Module Structure

```
apps/api/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── jwt-refresh.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── login.dto.ts
    ├── register.dto.ts
    └── auth-response.dto.ts
```

---

## 3. JWT Strategy

```typescript
// strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../users/users.repository';
import { env } from '@repo/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersRepo: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    return user; // attached to request.user
  }
}
```

---

## 4. JWT Guard

```typescript
// guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## 5. Roles Guard + Decorator

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@repo/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '@repo/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true; // no roles required

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
```

---

## 6. Current User Decorator

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserEntity } from '../users/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserEntity => {
    return ctx.switchToHttp().getRequest().user;
  },
);
```

---

## 7. Auth Service

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import type { LoginDto, RegisterDto, AuthResponseDto } from './dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersRepo.save(this.usersRepo.create({ ...dto, passwordHash }));

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  private issueTokens(user: UserEntity): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
```

---

## 8. Auth Module Setup

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '@repo/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}
```

---

## 9. Protecting Endpoints

```typescript
// estates.controller.ts
@Controller('estates')
export class EstatesController {
  // Public — no guard
  @Get()
  findAll() { ... }

  // Authenticated — any logged-in user
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateEstateDto) { ... }

  // Authorized — only landlords
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEstateDto) { ... }
}
```

---

## 10. Security Checklist

- [ ] JWT secret is ≥32 characters, stored in env vars, never committed
- [ ] Password hashed with bcrypt, salt rounds ≥ 12
- [ ] Error messages for login are generic (no "wrong password" vs "user not found")
- [ ] JWT expiry is short (15m–24h for access tokens)
- [ ] Refresh tokens stored hashed in DB with expiry
- [ ] Rate-limit `/auth/login` and `/auth/register` endpoints
- [ ] Never log passwords, tokens, or sensitive user data
- [ ] `@nestjs/throttler` installed and applied globally to auth routes
