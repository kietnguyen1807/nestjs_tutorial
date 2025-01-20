import { Test, TestingModule } from '@nestjs/testing';
import { RoleUserService } from './role_user.service';

describe('RoleUserService', () => {
  let service: RoleUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleUserService],
    }).compile();

    service = module.get<RoleUserService>(RoleUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
