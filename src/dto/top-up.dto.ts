import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopUpDto {
  @ApiProperty({ example: 1, description: 'Jumlah saldo yang ingin ditambah' })
    @IsInt({ message: 'Amount harus berupa angka bulat!' })
    @Min(50000, { message: 'Minimal top up balance adalah 50000!' })
    @IsNotEmpty()
    amount!: number;
}