import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { voucherProps } from '../interface/voucher.interface.js';

@Injectable()
export class VouchersService {
    constructor(private prisma: PrismaService){}

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
        return await this.prisma.$transaction(async (tx) => {
            const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
            if (!voucher) throw new BadRequestException('Voucher tidak ditemukan!');
            if (voucher.stock < quantity) throw new BadRequestException('Stock tidak cukup!');

            const totalCost = voucher.price * quantity;

            const user = await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: totalCost } }
            });

            if (user.balance < 0) throw new BadRequestException('Saldo tidak cukup');

            const updatedVoucher = await tx.voucher.update({
                where: { id: voucherId },
                data: { stock: { decrement: quantity } }
            });
            const codesVoucherArray: string[] = [];
            for (let i = 0; i < quantity; i++) {
                const code = `K-STORE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                codesVoucherArray.push(code);
            }
            const finalVoucherCodes = codesVoucherArray.join(', ');
            const historyTransaction = await tx.transaction.create({
                data: {
                    customerName: user.username, 
                    quantity: quantity,
                    totalCost: totalCost,
                    voucherId: voucherId,
                    voucherName: voucher.voucherName,
                    voucherCode: finalVoucherCodes
                }
            });

            return { 
                message: "Transaksi Berhasil!",
                item: voucher.voucherName,
                voucherCode: historyTransaction.voucherCode,
                sisaSaldo: user.balance
            };
        })
}
}
