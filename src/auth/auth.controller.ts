import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { loginProps } from '../interface/user.interface.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login(@Body() userData: loginProps){
        const result = await this.authService.login(userData);
        return {
            statusCode: 201,
            message: "Berhasil login",
            data: result,
        }
    }
}
