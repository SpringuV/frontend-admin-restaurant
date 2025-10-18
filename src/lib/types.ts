import { ReactNode } from "react";

export type PropsType = {
    onCollapse: (val: boolean) => void;
    collapsed: boolean;
}

export type TableType = {
    number: number;
    capacity: number;
    id: number;
    status: string;
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

export type AlertProps =   {
    title: 'Thông báo' | 'Thành công' | 'Lỗi' | 'Cảnh báo';
    message: string;
    icon?: ReactNode;
    type: AlertStatus;
    duration?: number;
    onClose?: () => void;
}

export type AlertStatus = 'success' | 'error' | 'info' | 'warning';