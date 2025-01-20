import { Module } from '@nestjs/common';
import { ProUserService } from './pro_user.service';
import { ProUserController } from './pro_user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from 'src/prisma/prisma.module';

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
  controllers: [ProUserController],
  providers: [ProUserService],
})
export class ProUserModule {}
