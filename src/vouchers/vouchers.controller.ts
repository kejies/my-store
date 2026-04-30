import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service.js';
import type { voucherProps } from '../interface/voucher.interface.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Role } from '../../generated/prisma/enums.js';
import { BuyVoucherDto } from '../dto/buy-voucher.dto.js';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
    constructor(private readonly vouchersService: VouchersService){}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('create-voucher')
    async createVoucher(@Body() voucherData: voucherProps){
        const result = await this.vouchersService.createVoucher(voucherData);
        return {
            statusCode: 201,
            message: "Berhasil membuat voucher!",
            data: result,
        }
    }

    @Get()
    async findAll() {
        const result = await this.vouchersService.findAllVoucher();
        return {
            statusCode: 200,
            message: "Berhasil mengambil semua Voucher!",
            data: result,
        };
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('/:id') 
    async editVoucher(
        @Param('id') id: string, 
        @Body() voucherData: voucherProps
    ) {
        const result = await this.vouchersService.editVoucher(Number(id), voucherData);
        return {
            statusCode: 200,
            message: "Berhasil mengubah voucher!",
            data: result
        };
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete('/:id')
    async deleteCategory(@Param('id') id: string) {
        const result = await this.vouchersService.deleteVoucher(Number(id));
        return {
            statusCode: 200,
            message: "Berhasil menghapus voucher!",
            data: result
        };
    }

    @UseGuards(AuthGuard)
    @Put('buy/:id')
    async buy(
        @Request() req, 
        @Param('id') id: string, 
        @Body() buyVoucherDto: BuyVoucherDto
    ) {
        const userId = req.user.sub;
        const voucherId = Number(id);
        
        return await this.vouchersService.buyVoucher(
            userId, 
            voucherId, 
            buyVoucherDto.quantity
        );
    }
}
