import { ReactNode } from "react";

export type PropsType = {
    onCollapse: (val: boolean) => void;
    collapsed: boolean;
}

export type TableType = {
    available: boolean;
    capacity: number;
    id_table: number;
    type: string;
}

export type PayloadToken = {
    sub?: string;
    userId?: string;
    scope?: string;
    exp?: number;
    iat?: number;
    jti?: string;
    iss?: string;
};

export type AlertProps = {
    title: 'Thông báo' | 'Thành công' | 'Lỗi' | 'Cảnh báo';
    message: string;
    icon?: ReactNode;
    type: AlertStatus;
    duration?: number;
    onClose?: () => void;
}

export type AlertStatus = 'success' | 'error' | 'info' | 'warning';

export type BookingType = {
    id_table: number;
    customer_name: string;
    phone_cus: string;
    sum_human: number;
    note_booking?: string;
    user_id: string;
}