import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { voucherProps } from '../interface/voucher.interface.js';
import { PaymentService } from '../payment/payment.service.js';
import { TransactionStatus } from '../../generated/prisma/enums.js';
@Injectable()
export class VouchersService {
    constructor(private prisma: PrismaService, private paymentService: PaymentService){}

    async createVoucher(voucherData: voucherProps) {
        const { voucherName, nominal, price, stock, categoryId } = voucherData;
        if (!categoryId) {
            throw new BadRequestException('ID Kategori tidak boleh kosong!');
        }   
        const category = await this.prisma.category.findUnique({
            where: { id: Number(categoryId) }
        });

        if (!category) {
            throw new NotFoundException(`Kategori dengan Id ${categoryId} tidak ditemukan!`);
        }

        return await this.prisma.voucher.create({
            data: {
                voucherName,
                nominal,
                price,
                stock,
                category: { connect: { id: categoryId } }
            }
        });
    }

    async findAllVoucher(){
        try {
            return await this.prisma.voucher.findMany();
        }catch (error) {
            console.error(error);
            throw error;
        }
    }

    async editVoucher(voucherId: number, voucherData:voucherProps){
        const { voucherName, nominal, price, stock, categoryId } = voucherData;

        try {
            return await this.prisma.voucher.update({
                where: {id:voucherId},
                data:{
                    voucherName,
                    nominal,
                    price,
                    stock,
                    categoryId
                }
            })
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Voucher Id ${voucherId} tidak ditemukan`);
            }
            console.error(error);
            throw new InternalServerErrorException('Gagal mengubah voucher');
        }
    }

    async deleteVoucher(voucherId:number){
        try {
            return await this.prisma.voucher.delete({where:{id:voucherId}})
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Voucher Id ${voucherId} tidak ditemukan`);
            }
            console.error(error);
            throw new InternalServerErrorException('Gagal menghapus voucher');
        }
    }

    async buyVoucher(userId: number, voucherId: number, quantity: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const voucher = await this.prisma.voucher.findUnique({ where: {id: voucherId}});

        if (!user) throw new NotFoundException('User tidak ditemukan');
        if(!voucher) throw new BadRequestException('Voucher tidak ditemukan!');
        if(voucher.stock < quantity) throw new BadRequestException('Stock tidak cukup!');

        const totalCost = voucher.price * quantity;
        const orderId = `INV-${Date.now()}`;

        await this.prisma.transaction.create({
            data: {
                orderId: orderId,
                userId: userId,
                customerName: user.username,
                quantity: quantity,
                totalCost: totalCost,
                voucherId: voucherId,
                voucherName: voucher.voucherName,
                status: TransactionStatus.PENDING
            }
        });

        const payment = await this.paymentService.createTransaction(orderId, totalCost);
        return  {
            message: "Transaksi berhasil dibuat",
            data: payment
        };
    }

    async handleWebhook(payload: any) {
        const { order_id, transaction_status } = payload;

        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            return await this.paymentService.handlePaymentSuccess(order_id);
        } 
        
        if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
            return await this.prisma.transaction.update({
                where: { orderId: order_id },
                data: { status: TransactionStatus.EXPIRED } 
            });
        }

        return { status: 'OK', message: 'Transaksi sudah diproses' };
    }
}
