import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstatesController } from './estates.controller';
import { EstatesService } from './estates.service';
import { EstatesRepository } from './estates.repository';
import { EstateEntity } from './entities/estate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstateEntity])],
  controllers: [EstatesController],
  providers: [EstatesService, EstatesRepository],
})
export class EstatesModule {}
