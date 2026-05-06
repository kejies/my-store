import { Body, Controller, Post, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { loginProps, registerProps } from '../interface/user.interface.js';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('register')
    async register(@Body() userData: registerProps){
        const result = await this.authService.register(userData);
        return {
            statusCode: 201,
            message: "Akun berhasil dibuat",
            data: result,
        }
    }

    @Post('login')
    async login(@Body() userData: loginProps){
        const result = await this.authService.login(userData);
        return {
            statusCode: 201,
            message: "Berhasil login",
            data: result,
        }
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getMe(@Request() req) {
        return this.authService.getMe(req.user.sub);
    }
}
