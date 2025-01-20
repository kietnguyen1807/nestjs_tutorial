import { Module } from '@nestjs/common';
import { RoleUserService } from './role_user.service';
import { RoleUserController } from './role_user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
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
  controllers: [RoleUserController],
  providers: [RoleUserService],
})
export class RoleUserModule {}
