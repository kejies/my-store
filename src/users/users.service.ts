import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionStatus } from '../../generated/prisma/enums.js';
import { PaymentService } from '../payment/payment.service.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private paymentService: PaymentService) {}
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

    async findOne(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                balance: true,
                role: true,
            }
        });
        return user;
    }

    async getHistory(userId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' }, 
                skip: skip,
                take: limit,
            }),
            this.prisma.transaction.count({
                where: { userId: userId },
            }),
        ]);

        return {
            data: transactions,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
