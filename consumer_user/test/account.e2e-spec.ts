import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AccountModule } from 'src/account/account.module';
import { AppModule } from 'src/app.module';

describe('Accounts', () => {
  let app: INestApplication;
  let token_admin: string;
  let token_basic: string;
  let account = [
    {
      id: 1,
      firstName: 'Joe',
      lastName: 'Doe',
      email: 'exist@example.com',
      avatar: 'https://example.com/avatar.jpg',
      location: 'New York',
      birthday: '1990-01-01T00:00:00.000Z',
      password: 'Kiet@18072002',
      roleType: 'basic',
    },
  ];

  let accountService = {
    getAccounts: () => ['test'],
    getAccountById: (id: number) => {
      if (id === 1) {
        return ['test'];
      } else {
        throw new NotFoundException('Account not found');
      }
    },
    createAccount: (dto) => {
      const existingAccount = account.find((u) => u.email === dto.email);
      if (existingAccount) {
        throw new NotFoundException('Email already exist');
      }
      const newAccount = { id: 1, ...dto };
      account.push(newAccount);
      return newAccount;
    },
    deleAccountById: (id: number) => {
      if (id === 1) {
        return { message: 'Account deleted successfully' };
      } else {
        throw new NotFoundException('Account not found');
      }
    },
    updateAccountById: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('Account not found');
      }
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AccountService)
      .useValue(accountService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const login_admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Kiet@18072002' });

    token_admin = login_admin.body.access_token;

    // Generate a valid JWT token
    const login_basic = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'khoi@example.com', password: 'Kiet@18072002' });

    token_basic = login_basic.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get All Account API Test', () => {
    it('should return all accounts with token admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true); // Assuming it returns an array of users
    });

    it('should return all accounts with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/account'); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Get Account By Id API Test', () => {
    it('GET Account by id (Successful)', async () => {
      const accountId = 1;
      const expectedAccount = accountService.getAccountById(accountId);
      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedAccount);
    });

    it('Get account by id (Account not found)', async () => {
      const accountId = 2; // An ID that doesn't exist
      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Get account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Get account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer()).get(
        `/account/${accountId}`,
      ); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Post Account API Test', () => {
    it('Post Account with token admin', async () => {
      const newAccount = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@example.com',
        avatar: 'https://example.com/avatar.jpg',
        location: 'New York',
        birthday: '1990-01-01T00:00:00.000Z',
        password: 'Kiet@18072002',
        roleType: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/account')
        .send(newAccount)
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header
      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({ id: 1, ...newAccount });
    });

    it('Post Account (Email already exist)', async () => {
      const newAccount = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'exist@example.com',
        avatar: 'https://example.com/avatar.jpg',
        location: 'New York',
        birthday: '1990-01-01T00:00:00.000Z',
        password: 'Kiet@18072002',
        roleType: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/account')
        .send(newAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Email already exist');
    });

    it('Post Account with token basic', async () => {
      const response = await request(app.getHttpServer())
        .post('/account')
        .send(account)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post Account with no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/account')
        .send(account);
      // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Dele Account By Id API Test', () => {
    it('Delete Account by id (Successful)', async () => {
      const accountId = 1;
      const expectedAccount = accountService.deleAccountById(accountId);
      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedAccount);
    });
    it('Delete Account by id (Account not found)', async () => {
      const accountId = 2;
      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Delete Account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .delete(`/account/${accountId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Delete Account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer()).delete(
        `/account/${accountId}`,
      ); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Update Account By Id API Test', () => {
    const updateAccount = {
      firstName: 'Jack',
      lastName: 'Doe',
    };
    it('Update Account by Id (Successful)', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ id: accountId, ...updateAccount });
    });

    it('update Account by id (Account not found)', async () => {
      const accountId = 2;
      const response = await request(app.getHttpServer())
        .patch(`/account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Update Account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Update Account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/account/${accountId}`)
        .send(updateAccount); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
