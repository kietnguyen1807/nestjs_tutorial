import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  INestMicroservice,
  NotFoundException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { ProAccountService } from 'src/pro_account/pro_account.service';
describe('Producer and Consumer Communication (e2e)', () => {
  let app: INestApplication;
  let appConsumer: INestMicroservice;
  let client: ClientProxy;
  let token_admin: string;
  let token_basic: string;
  let accounts = [
    {
      id: 1,
      firstName: 'Joe',
      lastName: 'Doe',
      email: 'exist@example.com',
      avatar: 'https://example.com/avatar.jpg',
      location: 'New York',
      birthday: '1990-01-01T00:00:00.000Z',
      password: 'Kiet@18072002',
      role: 'basic',
    },
  ];

  let accountService = {
    getAccounts: () => ['test'],
    getAccountById: (id: number) => {
      const account = accounts.find((u) => u.id === id);
      if (account) {
        return account; // Trả về object account đúng format
      } else {
        throw new NotFoundException('Account not found');
      }
    },
    createAccount: (dto) => {
      const existingUser = accounts.find((u) => u.email === dto.email);
      if (existingUser) {
        throw new NotFoundException('Email already exist');
      }
      const newAccount = { id: 1, ...dto };
      accounts.push(newAccount);
      return newAccount;
    },
    deleteAccount: (id: number) => {
      const account = accounts.find((u) => u.id === id);
      if (account) {
        return { message: 'Account deleted successfully' }; // Trả về object user đúng format
      } else {
        throw new NotFoundException('Account not found');
      }
    },
    updateAccount: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('Account not found');
      }
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          {
            name: 'USER_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'users-service',
            },
          },
        ]),
      ],
    })
      .overrideProvider(ProAccountService)
      .useValue(accountService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Khởi tạo ClientProxy (Producer)
    client = app.get<ClientProxy>('USER_SERVICE');
    await client.connect();

    // Khởi tạo và khởi động Consumer
    appConsumer = await app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'users-service',
      },
    });

    // Đăng nhập admin và lấy token
    const login_admin = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'admin@example.com', password: 'Kiet@18072002' });

    // Kiểm tra login thành công
    if (login_admin.status === 200 && login_admin.body.access_token) {
      token_admin = login_admin.body.access_token;
      console.log('Admin Token:', token_admin);
    } else {
      throw new Error('Login failed');
    }

    const login_basic = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'kiet@example.com', password: 'Kiet@18072002' });

    // Kiểm tra login thành công
    if (login_basic.status === 200 && login_basic.body.access_token) {
      token_basic = login_basic.body.access_token;
      console.log('Basic Token:', token_basic);
    } else {
      throw new Error('Login failed');
    }

    await appConsumer.listen();
  });

  describe('Get All Account API Test', () => {
    it('should return all accounts with token admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/pro-account')
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true); // Assuming it returns an array of users
    });

    it('should return all accounts with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get('/pro-account')
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/pro-account'); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Get Account By Id API Test', () => {
    it('GET Account by id (Successful)', async () => {
      const accountId = 1;
      const expectedAccount = accountService.getAccountById(accountId);
      const response = await request(app.getHttpServer())
        .get(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedAccount);
    });

    it('Get account by id (Account not found)', async () => {
      const accountId = 2; // An ID that doesn't exist
      const response = await request(app.getHttpServer())
        .get(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Get account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .get(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Get account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer()).get(
        `/pro-account/${accountId}`,
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
        role: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/pro-account')
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
        role: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/pro-account')
        .send(newAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Email already exist');
    });

    it('Post Account with token basic', async () => {
      const response = await request(app.getHttpServer())
        .post('/pro-account')
        .send(accounts)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post Account with no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/pro-account')
        .send(accounts);
      // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Dele Account By Id API Test', () => {
    it('Delete Account by id (Successful)', async () => {
      const accountId = 1;
      const expectedAccount = accountService.deleteAccount(accountId);
      const response = await request(app.getHttpServer())
        .delete(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedAccount);
    });
    it('Delete Account by id (Account not found)', async () => {
      const accountId = 2;
      const response = await request(app.getHttpServer())
        .delete(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Delete Account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .delete(`/pro-account/${accountId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Delete Account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer()).delete(
        `/pro-account/${accountId}`,
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
        .patch(`/pro-account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ id: accountId, ...updateAccount });
    });

    it('update Account by id (Account not found)', async () => {
      const accountId = 2;
      const response = await request(app.getHttpServer())
        .patch(`/pro-account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Account not found');
    });

    it('Update Account by id with token basic', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/pro-account/${accountId}`)
        .send(updateAccount)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Update Account by id with no token is provided', async () => {
      const accountId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/pro-account/${accountId}`)
        .send(updateAccount); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  afterAll(async () => {
    await client.close();
    await appConsumer.close();
    await app.close();
  });
});
