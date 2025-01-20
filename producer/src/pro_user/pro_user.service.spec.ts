import { Test, TestingModule } from '@nestjs/testing';
import { ProUserService } from './pro_user.service';

describe('ProUserService', () => {
  let service: ProUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProUserService],
    }).compile();

    service = module.get<ProUserService>(ProUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
