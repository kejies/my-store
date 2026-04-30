import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { registerProps } from '../interface/user.interface.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
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

    async findOneByUsername(username:string){
        const user = await this.prisma.user.findFirst({
            where: {username: username}
        });
        if(!user){
            throw new UnauthorizedException('Credential tidak valid!');
        }
        return user
    }

    async topUp(userId: number, amount: number) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: {
                balance: {
                    increment: amount
                }
            },
            select: { username: true, balance: true }
        })
    }
}
