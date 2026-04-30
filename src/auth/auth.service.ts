import { loginProps } from '../interface/user.interface.js';
import { UsersService } from '../users/users.service.js';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService){}
    
    async login(userData:loginProps){
        const user = await this.usersService.findOneByUsername(userData.username);
        const isMatch = await bcrypt.compare(userData.password, user.password);

        if(!user || !isMatch){
            throw new UnauthorizedException('username atau password salah!');
        }

        const payload = { sub: user.id, username: user.username, role: user.role};
        return {
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
            },
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
