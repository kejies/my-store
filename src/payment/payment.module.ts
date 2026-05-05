import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { VouchersModule } from '../vouchers/vouchers.module.js';

@Module({
  imports: [forwardRef(() => VouchersModule)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
