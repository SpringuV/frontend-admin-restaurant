import { BookingResponse, BookingType, CancelOrderRequest, CancelOrderResponse, CreateOrderRequest, CreateOrderResponse, LoadFoodResponse, LoadTableResponse, TableOrderDetailResponse } from "@/lib/types";
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