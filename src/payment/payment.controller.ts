import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { VouchersService } from '../vouchers/vouchers.service.js';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService, private readonly vouchersService: VouchersService){}

    @Post('create-qris')
    async createTransaction(@Body() data: {orderId: string; amount: number}, @Res() res){
        try {
            const result = await this.paymentService.createTransaction(data.orderId, data.amount);
            return res.status(HttpStatus.CREATED).json({
                message: 'Transaksi berhasil dibuat',
                data: result
            });
        } catch (error: any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: error.message
            });
        }
    }

    @Post('webhook')
    async handleMidtrans(@Body() payload: any) {
        return await this.vouchersService.handleWebhook(payload);
    }
}
