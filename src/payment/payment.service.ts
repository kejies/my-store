import { Injectable } from '@nestjs/common';
import midtransClient from 'midtrans-client';
import "dotenv/config";
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PaymentService {
    private snap: any;

    constructor(private prisma: PrismaService) {
        this.snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.SERVER_KEY_MIDTRANS,
            clientKey: process.env.CLIENT_ID_MIDTRANS,
        });
    }

    async createTransaction(orderId: String, amount: number){
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            usage_limit: 1,
        };

        try {
            const transaction = await this.snap.createTransaction(parameter);
            return transaction;
        } catch(error: any) {
            console.error('Detail Error Midtrans', error.ApiResponse)
            throw new Error(`Gagal membuat transaksi Midtrans ${error.message}`);
        }
    }

    async handlePaymentSuccess(orderId: string) {
        return await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { orderId } });

            if (!transaction || transaction.status !== 'PENDING') return;

            if (transaction.voucherId) {
                await tx.voucher.update({
                    where: { id: transaction.voucherId },
                    data: { stock: { decrement: transaction.quantity } }
                });
                
                const codes = Array.from({ length: transaction.quantity }, () => `CODE-${Math.random().toString(36).toUpperCase()}`);
                await tx.transaction.update({
                    where: { orderId },
                    data: { status: 'SUCCESS', voucherCode: codes.join(', ') }
                });
            } 
            else {
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { balance: { increment: transaction.totalCost } }
                });

                await tx.transaction.update({
                    where: { orderId },
                    data: { status: 'SUCCESS' }
                });
            }
        });
    }
}
