import { BookingResponse, BookingType, CancelOrderRequest, CancelOrderResponse, CreateInvoiceRequest, CreateInvoiceResponse, CreateOrderRequest, CreateOrderResponse, LoadFoodResponse, LoadTableResponse, PaymentStatusResponse, TableOrderDetailResponse } from "@/lib/types";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";


export function useLoadGuestTable() {
    const { data, error, isLoading, mutate } = useSWR<LoadTableResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/table`,
        fetcherWithAutoRefresh
    );

    return {
        tables: data?.result || [],
        isLoading,
        error,
        reload: mutate,
    };
}

export function useBookingTable() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        BookingResponse,
        Error,
        string,
        BookingType
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/table`,
        async (url, { arg }) => fetcherWithAutoRefresh(url, { method: "POST", body: arg })
    );

    return {
        bookTable: trigger,
        isLoading: isMutating,
        error,
        data,
    };
}


// Hook: Lấy chi tiết order cụ thể
export function useGetOrderDetail() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        TableOrderDetailResponse,
        Error,
        string,
        number // Chỉ cần orderId (string)
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/table/orders`,
        async (url, { arg: orderId }) => {
            console.log("order-id: ", orderId)
            return fetcherWithAutoRefresh(`${url}/${orderId}`, { method: "GET" });
        }
    );

    return {
        getOrderDetail: trigger,
        orderDetail: data,
        isLoading: isMutating,
        error,
    };
}

// Load danh sách món ăn
export function useLoadFoods() {
    const { data, error, isLoading, mutate } = useSWR<LoadFoodResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/food`,
        fetcherWithAutoRefresh
    );

    return {
        foods: data?.result || [],
        isLoading,
        error,
        reload: mutate,
    };
}

// Tạo order món ăn
export function useCreateUpdateOrder() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        CreateOrderResponse | boolean,
        Error,
        string,
        CreateOrderRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/table/orders/update`,
        async (url, { arg }) => fetcherWithAutoRefresh(url, { method: "POST", body: arg })
    );

    return {
        createOrder: trigger,
        isLoading: isMutating,
        error,
        data,
    };
}

export function useCancelOrder() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        CancelOrderResponse,
        Error,
        string,
        CancelOrderRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/table/order/cancel`,
        async (url, { arg }) => fetcherWithAutoRefresh(url, { method: "POST", body: arg })
    );

    return {
        cancelOrder: trigger,   // Hàm gọi để hủy order
        cancelLoading: isMutating,  // Trạng thái loading
        errorCancel: error,                  // Lỗi (nếu có)
        dataCancel: data,                   // Kết quả trả về { is_cancelled: true }
    };
}

// ===== PAYMENT & INVOICE HOOKS =====

/**
 * Hook: Tạo Invoice cho Order
 * - Tạo invoice mới với payment_method
 * - CASH → status = PAID ngay
 * - BANKING → status = PENDING, chờ webhook
 */
export function useCreateInvoicePayment() {
    const { trigger, isMutating, error, data } = useSWRMutation
    <
        CreateInvoiceResponse,
        Error,
        string,
        CreateInvoiceRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/invoice/create`,
        async (url, { arg }) => {
            // Lấy token từ localStorage để gửi kèm request
            const token = localStorage.getItem('token');

            return fetcherWithAutoRefresh<CreateInvoiceResponse>(
                url,
                {
                    method: "POST",
                    body: arg,
                    token // Gửi token để auto-refresh nếu cần
                }
            );
        }
    );

    return {
        createInvoice: trigger,
        isCreatingInvoice: isMutating,
        invoiceError: error,
        invoiceData: data,
    };
}

/**
 * Hook: Kiểm tra trạng thái thanh toán
 * - Dùng để polling hoặc kiểm tra manual
 */
export function useCheckPaymentStatus() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        PaymentStatusResponse,
        Error,
        string,
        number
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/invoice/status`,
        async (url, { arg: orderId }) => {
            return fetcherWithAutoRefresh(`${url}/${orderId}`, { method: "GET" });
        }
    );

    return {
        checkPaymentStatus: trigger,
        isChecking: isMutating,
        statusError: error,
        paymentStatus: data?.result?.payment_status,
    };
}