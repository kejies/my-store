import { PrismaService } from '@/prisma/prisma.service.js';
import { loginProps, registerProps } from '../interface/user.interface.js';
import { UsersService } from '../users/users.service.js';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,private usersService: UsersService, private jwtService: JwtService){}
    
        async register(userData:registerProps) {
            const saltRounds = 10;
            const usernameExists = await this.prisma.user.findFirst({
                    where: { username: userData.username }
            });
            const emailExists = await this.prisma.user.findFirst({
                    where: { email: userData.email }
            });
            if(usernameExists){
                throw new BadRequestException('Username ini sudah terdaftar.')
            }
            if(emailExists){
                throw new BadRequestException('Email ini sudah terdaftar.')
            }
    
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const newUser = await this.prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            });
            return newUser
        }
    
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

    async getMe(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
        throw new NotFoundException('User tidak ditemukan');
        }
        return user;
   }
}
