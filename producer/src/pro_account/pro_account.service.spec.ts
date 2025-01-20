import { Test, TestingModule } from '@nestjs/testing';
import { ProAccountService } from './pro_account.service';

describe('ProAccountService', () => {
  let service: ProAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProAccountService],
    }).compile();

    service = module.get<ProAccountService>(ProAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
