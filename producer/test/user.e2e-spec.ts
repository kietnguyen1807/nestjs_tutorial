import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  INestMicroservice,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { join } from 'path';
import { ProUserService } from 'src/pro_user/pro_user.service';
describe('Producer and Consumer Communication (e2e)', () => {
  let app: INestApplication;
  let appConsumer: INestMicroservice;
  let client: ClientProxy;
  let token_admin: string;
  let token_basic: string;
  let users = [
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

  let userService = {
    getUser: () => ['test'],
    getUserById: (id: number) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        return user; // Trả về object user đúng format
      } else {
        throw new NotFoundException('User not found');
      }
    },
    createUser: (dto) => {
      const existingUser = users.find((u) => u.email === dto.email);
      if (existingUser) {
        throw new NotFoundException('Email already exist');
      }
      const newUser = { id: 1, ...dto };
      users.push(newUser);
      return newUser;
    },
    deleteUser: (id: number) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        return { message: 'User deleted successfully' }; // Trả về object user đúng format
      } else {
        throw new NotFoundException('User not found');
      }
    },
    updateUser: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    createAccountForUser: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    uploadAva: (
      id: number,
      avapath: string,
      sizepath: string,
      typepath: string,
    ) => {
      if (id === 1) {
        return {
          avatar: avapath,
          size_image: sizepath,
          type_image: typepath,
        };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    uploadFile: (
      id: number,
      filepath: string,
      sizepath: string,
      typepath: string,
    ) => {
      if (id === 1) {
        return {
          avatar: filepath,
          size_image: sizepath,
          type_image: typepath,
        };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    Download: (filename: string, res: Response) => {
      const filePath = join(process.cwd(), 'uploads_file', filename);
      if (filename === 'test2.rtf') {
        const fileStream = fs.createReadStream(filePath);
        res.set({
          'Content-Type': 'application/rtf', // Hoặc tùy loại file
          'Content-Disposition': `attachment; filename="${filename}"`,
        });
        return new StreamableFile(fileStream);
      } else {
        throw new NotFoundException('File not found');
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
      .overrideProvider(ProUserService)
      .useValue(userService)
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

  describe('Get ALLUser API Test', () => {
    it('should return all users with token admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/pro-user')
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true); // Assuming it returns an array of users
    });

    it('should return all users with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get('/pro-user')
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/pro-user'); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Get User By Id API Test', () => {
    it('Get User By Id', async () => {
      const userId = 1;
      const expectedUser = userService.getUserById(userId);
      const response = await request(app.getHttpServer())
        .get(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedUser);
    });

    it('Get user by id (User not found)', async () => {
      const userId = 2; // An ID that doesn't exist
      const response = await request(app.getHttpServer())
        .get(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
    });

    it('Get user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .get(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Get user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).get(
        `/pro-user/${userId}`,
      ); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Post User API Test', () => {
    it('Post user with token admin', async () => {
      const newUser = {
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
        .post('/pro-user')
        .send(newUser)
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header
      console.log(response);
      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({ id: 1, ...newUser });
    });

    it('Post user (Email already exist)', async () => {
      const newUser = {
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
        .post('/pro-user')
        .send(newUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Email already exist');
    });

    it('Post user with token basic', async () => {
      const response = await request(app.getHttpServer())
        .post('/pro-user')
        .send(users)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post user with no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/pro-user')
        .send(users);
      // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Dele User By Id API Test', () => {
    it('Delete user by id (Successful)', async () => {
      const userId = 1;
      const expectedUser = userService.deleteUser(userId);
      const response = await request(app.getHttpServer())
        .delete(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedUser);
    });
    it('Delete user by id (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .delete(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Delete user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .delete(`/pro-user/${userId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Delete user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).delete(
        `/pro-user/${userId}`,
      ); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Update User By Id API Test', () => {
    const updateUser = {
      firstName: 'Jack',
      lastName: 'Doe',
    };
    it('Update user by Id (Successful)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/pro-user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ id: userId, ...updateUser });
    });

    it('update user by id (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .patch(`/pro-user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Update user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/pro-user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Update user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/pro-user/${userId}`)
        .send(updateUser); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Create Account for user', () => {
    const createAccount = {
      password: 'Kiet@18072002',
    };
    it('Create Account for user (successful)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({ id: userId, ...createAccount });
    });

    it('Create Account for user (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Create Account for user with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Create Account for user with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/account/${userId}`)
        .send(createAccount);
      // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Post upload ava API Test', () => {
    const filePath = path.resolve('D:/document/images/5924271.jpg'); // Tạo một tệp giả lập
    const fail_path = path.resolve('D:/document/English/wiring/index.test.rtf');
    const error_filename = path.resolve(
      'D:/document/images/An toàn, vệ sinh lao động không chỉ là một khái niệm trừu tượng mà còn là hiện thân của sự tôn trọng con người, đề cao giá trị cuộc sống. Mỗi ngày, hàng triệu người lao động trên khắp thế giới đang miệt mài cống hiến sức mìn.jpg',
    );
    it('Post upload avatar (successful)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(201);
      expect(response.body.avatar).toBeDefined();
      expect(response.body.size_image).toBeGreaterThan(0);
    });

    it('Post upload avatar (Invalid format file)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/ava/${userId}`)
        .attach('ava', fail_path) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid format file.');
    });

    it('Post upload avatar (Invalid file name)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/ava/${userId}`)
        .attach('ava', error_filename) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid file name.');
    });

    it('Post upload avatar (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Post upload avatar with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post upload avatar without token', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).post(
        `/pro-user/ava/${userId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Post upload file API Test', () => {
    const filePath = path.resolve('D:/document/English/wiring/index.test.rtf'); // Tạo một tệp giả lập
    const fail_path = path.resolve('D:/document/images/5924271.jpg');
    const error_filename = path.resolve(
      'D:/document/I am writing to give you some feedback about your new computer sofware. First, I am satisfied with the instruction manual which was printed in many languages. This was so helpful because english is not my first language. Second, fo.txt',
    );
    it('Post upload file (successful)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });

    it('Post upload file (Invalid format file)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/file/${userId}`)
        .attach('file', fail_path) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid format file.');
    });

    it('Post upload file (Invalid file name)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/file/${userId}`)
        .attach('file', error_filename) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid file name.');
    });

    it('Post upload file (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Post upload file with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/pro-user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post upload file without token', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).post(
        `/pro-user/file/${userId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Download file API test', () => {
    const validfile = 'test2.rtf';
    const invalidfile = 'nonexistentFile.rtf';
    it('GET download file (Successful)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pro-user/download/${validfile}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/rtf');
      expect(response.header['content-disposition']).toBe(
        `attachment; filename="${validfile}"`,
      );
    });

    it('GET download file (File not found)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pro-user/download/${invalidfile}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('File not found');
    });

    it('GET download file with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pro-user/download/${validfile}`)
        .set('Authorization', `Bearer ${token_basic}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('GET download file without token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/pro-user/download/${validfile}`,
      );

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
