import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import {
  INestApplication,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { join } from 'path';
import { Response } from 'express'; // This should come from express

describe('Users', () => {
  let app: INestApplication;
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
      roleType: 'basic',
    },
  ];

  let userService = {
    getUsers: () => ['test'],
    getUserById: (id: number) => {
      if (id === 1) {
        return ['test'];
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
    deleUserById: (id: number) => {
      if (id === 1) {
        return { message: 'User deleted successfully' };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    updateUserById: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    createAccountforUser: (id: number, dto) => {
      if (id === 1) {
        return { id, ...dto };
      } else {
        throw new NotFoundException('User not found');
      }
    },
    uploadava: (
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
    uploadfile: (
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
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue(userService)
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

  describe('Get ALLUser API Test', () => {
    it('should return all users with token admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true); // Assuming it returns an array of users
    });

    it('should return all users with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/user'); // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Get User By Id API Test', () => {
    it('GET user by id (Successful)', async () => {
      const userId = 1;
      const expectedUser = userService.getUserById(userId);
      const response = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedUser);
    });

    it('Get user by id (User not found)', async () => {
      const userId = 2; // An ID that doesn't exist
      const response = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Get user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Get user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).get(
        `/user/${userId}`,
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
        roleType: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUser)
        .set('Authorization', `Bearer ${token_admin}`); // Attach token to the Authorization header
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
        roleType: 'basic',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Email already exist');
    });

    it('Post user with token basic', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(users)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post user with no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(users);
      // No Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Dele User By Id API Test', () => {
    it('Delete user by id (Successful)', async () => {
      const userId = 1;
      const expectedUser = userService.deleUserById(userId);
      const response = await request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expectedUser);
    });
    it('Delete user by id (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Delete user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Delete user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).delete(
        `/user/${userId}`,
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
        .patch(`/user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ id: userId, ...updateUser });
    });

    it('update user by id (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .patch(`/user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Update user by id with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/user/${userId}`)
        .send(updateUser)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Update user by id with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .patch(`/user/${userId}`)
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
        .post(`/user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({ id: userId, ...createAccount });
    });

    it('Create Account for user (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Create Account for user with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/account/${userId}`)
        .send(createAccount)
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Create Account for user with no token is provided', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/account/${userId}`)
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
        .post(`/user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(201);
      expect(response.body.avatar).toBeDefined();
      expect(response.body.size_image).toBeGreaterThan(0);
    });

    it('Post upload avatar (Invalid format file)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/ava/${userId}`)
        .attach('ava', fail_path) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid format file.');
    });

    it('Post upload avatar (Invalid file name)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/ava/${userId}`)
        .attach('ava', error_filename) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid file name.');
    });

    it('Post upload avatar (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Post upload avatar with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/ava/${userId}`)
        .attach('ava', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post upload avatar without token', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).post(
        `/user/ava/${userId}`,
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
        .post(`/user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });

    it('Post upload file (Invalid format file)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/file/${userId}`)
        .attach('file', fail_path) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid format file.');
    });

    it('Post upload file (Invalid file name)', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/file/${userId}`)
        .attach('file', error_filename) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid file name.');
    });

    it('Post upload file (User not found)', async () => {
      const userId = 2;
      const response = await request(app.getHttpServer())
        .post(`/user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('Post upload file with token basic', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post(`/user/file/${userId}`)
        .attach('file', filePath) // Gửi tệp lên server
        .set('Authorization', `Bearer ${token_basic}`); // Attach token to the Authorization header

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('Post upload file without token', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer()).post(
        `/user/file/${userId}`,
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
        .get(`/user/download/${validfile}`)
        .set('Authorization', `Bearer ${token_admin}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/rtf');
      expect(response.header['content-disposition']).toBe(
        `attachment; filename="${validfile}"`,
      );
    });

    it('GET download file (File not found)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/download/${invalidfile}`)
        .set('Authorization', `Bearer ${token_admin}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('File not found');
    });

    it('GET download file with token basic', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/download/${validfile}`)
        .set('Authorization', `Bearer ${token_basic}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('GET download file without token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/user/download/${validfile}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
