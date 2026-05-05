import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { registerProps } from '../interface/user.interface.js';
import { TransactionStatus } from '../../generated/prisma/enums.js';
import { PaymentService } from '../payment/payment.service.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private paymentService: PaymentService) {}
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
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User tidak ditemukan');

        const orderId = `TOPUP-${Date.now()}-${userId}`;

        await this.prisma.transaction.create({
            data: {
                orderId: orderId,
                userId: userId,
                customerName: user.username,
                totalCost: amount,
                quantity: 1,
                status: TransactionStatus.PENDING,
                voucherName: 'Top Up Saldo'            }
        });

        const payment = await this.paymentService.createTransaction(orderId, amount);

        return {
            message: "Silahkan selesaikan pembayaran top up",
            data: payment
        };
    }
}
