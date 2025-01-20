import { Test, TestingModule } from '@nestjs/testing';
import { ProAccountController } from './pro_account.controller';
import { ProAccountService } from './pro_account.service';

describe('ProAccountController', () => {
  let controller: ProAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProAccountController],
      providers: [ProAccountService],
    }).compile();

    controller = module.get<ProAccountController>(ProAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
