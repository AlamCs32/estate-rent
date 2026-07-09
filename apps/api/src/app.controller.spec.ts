import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return root message', () => {
    expect(controller.getRoot()).toEqual({
      message: 'EstateRent API',
      version: '0.1.0',
    });
  });
});
