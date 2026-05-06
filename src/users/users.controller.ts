import { Body, Controller, Post, UseGuards, Request, Query, Get } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { TopUpDto } from '../dto/top-up.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @UseGuards(AuthGuard)
    @Post('topup')
    async topup(@Request() req, @Body() topUpDto:TopUpDto) {
        const userId = req.user.sub
        return await this.userService.topUp(userId, topUpDto.amount)
    }

    @UseGuards(AuthGuard)
    @Get('history')
    async getHistory(@Query('page') page: string = '1', @Query('limit') limit: string = '5', @Request() req) { 
        return await this.userService.getHistory(req.user.sub, Number(page), Number(limit));
    }
}
