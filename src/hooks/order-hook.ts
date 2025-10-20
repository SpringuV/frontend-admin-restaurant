import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcherWithAutoRefresh } from "@/hooks/fetcher-with-auto-refresh";
import { CancelOrderRequest, CancelOrderResponse, CreateOrderRequest, CreateOrderResponse, LoadFoodResponse } from "@/lib/types";

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