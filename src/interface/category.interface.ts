import { voucherProps } from "./voucher.interface.js";

export interface categoryProps {
    id?: number;
    name: string;
    voucher?: voucherProps[];
}