import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyVoucherDto {
  @ApiProperty({ example: 1, description: 'Jumlah voucher yang dibeli' })
    @IsInt({ message: 'Quantity harus berupa angka bulat!' })
    @Min(1, { message: 'Minimal pembelian adalah 1 unit!' })
    @IsNotEmpty()
    quantity!: number;
}