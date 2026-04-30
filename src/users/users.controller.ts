import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
import type { registerProps } from '../interface/user.interface.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { TopUpDto } from '../dto/top-up.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('register')
    async register(@Body() userData: registerProps) {
        const result = await this.userService.register(userData);

        return {
            statusCode: 201,
            message: "Berhasil membuat akun!",
            data: result,
        }
    }

    @UseGuards(AuthGuard)
    @Post('topup')
    async topup(@Request() req, @Body() topUpDto:TopUpDto) {
        const userId = req.user.sub
        return await this.userService.topUp(userId, topUpDto.amount)
    }
}
