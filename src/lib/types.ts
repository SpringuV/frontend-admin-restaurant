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

// ===== Ingredient Types =====

export enum UnitOfMeasurement {
    KG = 'KG',
    GRAM = 'GRAM',
    CÁI = 'CÁI',
    BÓ = 'BÓ',
    THÙNG = 'THÙNG',
    HỘP = 'HỘP',
    TÚI = 'TÚI',
    CHIẾC = 'CHIẾC',
    VIEN = 'VIÊN',
    ĐÔI = 'ĐÔI',
    LỌ = 'LỌ',
    BÌNH = 'BÌNH'
}

export interface IngredientType {
    id_ingredient: string;
    name_ingredients: string;
    prices: number;
    quantity: number;
    unit_of_measurement: UnitOfMeasurement;
    description: string;
    supplier: string;
    created_at: string;
    updated_at: string;
}

export interface CreateIngredientRequest {
    name_ingredients: string;
    prices: number;
    quantity: number;
    unit_of_measurement: UnitOfMeasurement;
    description?: string;
    supplier?: string;
}

export interface UpdateIngredientRequest {
    id_ingredient: string;
    prices: number;
    quantity: number;
    unit_of_measurement: UnitOfMeasurement;
    description?: string;
    supplier?: string;
}

export interface CreateIngredientResponse {
    code: number;
    message: string;
    result: IngredientType;
}

export interface UpdateIngredientResponse {
    code: number;
    message: string;
    result: IngredientType;
}

export interface DeleteIngredientResponse {
    code: number;
    message: string;
    result: {
        is_deleted: boolean;
        message: string;
    };
}

export interface LoadSupplierAndIngredientResponse {
    code: number
    message?: string
    result: {
        list_name_supplier_and_ingredient_response: {
            name_supplier: string
            ingredient_of_warehouse: {
                name_ingredients: string
                prices: number
                quantity: number
            }
        }[]
    }
}

export interface LoadIngredientsResponse {
    code: number;
    message?: string;
    result: IngredientType[];
}

export interface InventoryTransactionRequest {
    quantity: number; // số lượng nhập/xuất
    type: 'IMPORT' | 'EXPORT'; // "IMPORT" hoặc "EXPORT"
    note: string; // tùy chọn
    id_user: string;
    name_ingredients: string;
    name_supplier: string;
    code_warehouse: string;
}

export interface ImportExportRequest {
    code_warehouse: string;
    name_supplier: string;
    name_ingredients: string;
    quantity: number;
    note: string;
    type: 'IMPORT' | 'EXPORT';
    id_user: string | null;
}

export interface WarehouseType {
    code_warehouse: string;
    name_warehouse: string;
    address_warehouse: string;
}

export interface LoadInventoryTransactionResponse {
    id: number
    quantity: number
    note: string
    type: "EXPORT" | "IMPORT"
    created_at: string
    user_response: {
        id_user: string
        full_name: string
    }
    ingredient_response: {
        id_ingredient: string,
        name_ingredients: string,
        prices: number,
        unit_of_measurement: UnitOfMeasurement,
        supplier: string
    }
}