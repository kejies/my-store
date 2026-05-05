import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { VouchersModule } from './vouchers/vouchers.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoryModule } from './category/category.module.js';
import { PaymentModule } from './payment/payment.module.js';

@Module({
  imports: [PrismaModule, UsersModule, VouchersModule, AuthModule, CategoryModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
