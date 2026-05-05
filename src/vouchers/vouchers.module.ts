import { forwardRef, Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller.js';
import { VouchersService } from './vouchers.service.js';
import { PaymentModule } from '../payment/payment.module.js';
@Module({
  imports: [forwardRef(() => PaymentModule)],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
