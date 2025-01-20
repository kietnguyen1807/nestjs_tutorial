import { Test, TestingModule } from '@nestjs/testing';
import { ProUserController } from './pro_user.controller';
import { ProUserService } from './pro_user.service';

describe('ProUserController', () => {
  let controller: ProUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProUserController],
      providers: [ProUserService],
    }).compile();

    controller = module.get<ProUserController>(ProUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
