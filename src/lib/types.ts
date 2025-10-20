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

// ===== NEW: Order & Food Types =====

export interface FoodItem {
    id_food: number;
    name_food?: string;
    quantity: number
    price: number
    note: string
    image_url?: string;
    type_food?: string;
    description?: string;
}

export interface SelectedFood extends FoodItem {
    quantity: number;
    note: string;
}

export interface OrderFoodItem {
    id_food: number;
    quantity: number;
    note: string;
    price?: number;
    name_food?: string;
}

export interface CreateOrderResponse {
    result: OrderResponse;
}

export interface CreateOrderRequest {
    id_order: number;
    id_table: number;
    phone_number: string;
    note_order: string;
    order_status: string;
    total_amount: number;
    food_items: {
        id_food: number;
        quantity: number;
        note: string;
    }[];
}

export interface OrderResponse {
    id_order: number;
    order_status: string;
    total_amount: number;
    created_at: string;
    updated_at?: string;
}

export interface BookingResponse {
    result: {
        customerBookingResponse: {
            name_cus: string;
            phone_number_cus: string;
        };
        orderBookingResponse: {
            id_order: number;
            note_order: string;
            order_status: string;
            created_at: string;
            id_table: number;
        };
    }
}

// ===== API Response Wrappers =====

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export interface LoadFoodResponse {
    result: FoodItem[];
}

export interface LoadTableResponse {
    result: TableType[];
}

export interface BookingTableResponse {
    result: BookingResponse;
}


export interface TableOrdersResponse {
    result: OrderSummary[];
}

export interface OrderSummary {
    id_order: number;
    customer_name: string;
    sum_human: number;
    order_status: 'READY' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
    total_amount: number;
    created_at: string;
    food_count: number;
}

export type DataPropsToModalDetail = {
    created_at?: string | number | null | Date
    id_order: number
    id_table: number
    name_cus: string
    note_order?: string
    order_item_list_response: {
        id_food: string
        name_food: string
        price: number
        quantity: number
        note_special: string
    }[]
    order_status: 'READY' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
    phone_cus: string
    sum_human: number
    total_amount: number
}

export type TableOrderDetailResponse = {
    code: number
    message?: string
    result: {
        created_at?: string | number | null | Date
        id_order: number
        id_table: number
        name_cus: string
        note_order?: string
        order_item_list_response: {
            id_food: string
            name_food: string
            price: number
            quantity: number
            note_special: string
        }[]
        order_status: 'READY' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
        phone_cus: string
        sum_human: number
        total_amount: number
    }
}

export interface OrderItemCreateRequest {
    id_food: string
    quantity: number
    note: string
}


export interface OrderData {
    id_order: number;
    id_table: number;
    phone_number: string;
    note_order: string;
    order_status: string;
    total_amount: number;
    food_items: {
        id_food: number;
        quantity: number;
        note: string;
    }[];
}

export interface ModalOrderFoodProps {
    isOpen: boolean;
    onClose: () => void;
    orderInfo: {
        id_order: number;
        id_table: number;
        customer_name: string;
        phone_number: string;
    };
    onSubmit: (orderData: OrderData) => void;
}

/**
 * Interface đơn giản cho booking info
 */
export interface BookingSessionInfo {
    id_table: number;
    id_order: number;
    phone_cus: string;
}

export interface ConfirmDialogProps {
    isOpenDialog: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}


export interface CancelOrderRequest {
    id_order: number;
}

export interface CancelOrderResponse {
    code: number
    message?: string
    result: {
        is_cancelled: boolean;
    }
}