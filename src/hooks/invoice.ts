import useSWR from "swr";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";

// ===== TYPES =====
export interface OrderItem {
    id_order_item: number;
    name_food: string;
    quantity: number;
    price: number;
    note?: string;
}

export interface Customer {
    phone_number_cus: string;
    name_cus: string;
}

export interface User {
    full_name: string;
}

export interface Order {
    id_order: number;
    note_order?: string;
    order_status: 'PENDING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    total_amount: number;
    order_item_list: OrderItem[];
}

export interface Invoice {
    id_invoice: string;
    discount: number;
    payment_method: 'CASH' | 'BANKING';
    payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
    note?: string;
    created_at: number; // timestamp từ backend
    updated_at: number; // timestamp từ backend
    user: User;
    orders: Order;
    customer: Customer;
}

export interface LoadInvoicesResponse {
    code: number;
    result: Invoice[];
}

// ===== REVENUE STATISTICS TYPES =====
export interface PaymentStatusStats {
    paidCount: number;
    paidAmount: number;
    pendingCount: number;
    pendingAmount: number;
    refundedCount: number;
    refundedAmount: number;
}

export interface PaymentMethodStats {
    cashCount: number;
    cashAmount: number;
    bankingCount: number;
    bankingAmount: number;
}

export interface TimeRangeStats {
    startDate: number; // timestamp
    endDate: number; // timestamp
    totalDays: number;
    averageRevenuePerDay: number;
    averageOrderValue: number;
}

export interface TopCustomer {
    customerId: string;
    customerName: string;
    phoneNumber: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
}

export interface TopEmployee {
    employeeId: string;
    employeeName: string;
    username: string;
    totalInvoices: number;
    totalRevenue: number;
    averageInvoiceValue: number;
}

export interface DailyRevenue {
    date: number; // timestamp
    totalInvoices: number;
    totalRevenue: number;
    totalDiscount: number;
    netRevenue: number;
}

export interface RevenueStatistics {
    totalRevenue: number;
    totalDiscount: number;
    netRevenue: number;
    totalInvoices: number;
    totalOrders: number;
    paymentStatusStats: PaymentStatusStats;
    paymentMethodStats: PaymentMethodStats;
    timeRangeStats: TimeRangeStats;
    topCustomers: TopCustomer[];
    topEmployees: TopEmployee[];
    dailyRevenues: DailyRevenue[];
}

export interface LoadRevenueStatisticsResponse {
    code: number;
    result: RevenueStatistics;
}

// ===== HOOK: Load Invoice Dashboard =====
export function useLoadInvoiceDashboard() {
    const { data, error, isLoading, mutate } = useSWR<LoadInvoicesResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/invoice/dashboard`,
        fetcherWithAutoRefresh,
        {
            revalidateOnFocus: false, // Không refresh khi focus vào tab
            revalidateOnReconnect: true, // Chỉ refresh khi reconnect
            dedupingInterval: 5000, // Dedupe requests trong 5 giây
            refreshInterval: 30000, // Tự động refresh mỗi 30 giây
            errorRetryCount: 3, // Retry tối đa 3 lần khi lỗi
        }
    );

    return {
        invoices: data?.result || [],
        isLoadingInvoices: isLoading,
        invoicesError: error,
        reloadInvoices: mutate,
    };
}

// ===== HOOK: Load Revenue Statistics =====
export function useLoadRevenueStatistics() {
    const { data, error, isLoading, mutate } = useSWR<LoadRevenueStatisticsResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/invoice/revenue-statistics`,
        fetcherWithAutoRefresh,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 10000, // Dedupe 10 giây vì data ít thay đổi
            refreshInterval: 60000, // Refresh mỗi 60 giây
            errorRetryCount: 3,
        }
    );

    return {
        statistics: data?.result || null,
        isLoadingStatistics: isLoading,
        statisticsError: error,
        reloadStatistics: mutate,
    };
}
