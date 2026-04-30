import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { VouchersModule } from './vouchers/vouchers.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoryModule } from './category/category.module.js';

@Module({
  imports: [PrismaModule, UsersModule, VouchersModule, AuthModule, CategoryModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
