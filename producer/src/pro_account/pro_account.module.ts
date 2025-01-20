import { Module } from '@nestjs/common';
import { ProAccountService } from './pro_account.service';
import { ProAccountController } from './pro_account.controller';
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
  controllers: [ProAccountController],
  providers: [ProAccountService],
})
export class ProAccountModule {}
