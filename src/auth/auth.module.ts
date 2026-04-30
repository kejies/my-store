import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global:true,
      secret: process.env.JWT_SECRET || "kepo",
      signOptions: {expiresIn: '1d'},
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
