import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PaymentModule } from '../payment/payment.module.js';
@Module({
  imports: [forwardRef(() => PaymentModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
