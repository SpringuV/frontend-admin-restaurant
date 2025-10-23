import useSWR from "swr";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";
import { LoadInventoryTransactionResponse, WarehouseType } from '@/lib/types';

// Generic ApiResponse used by backend
interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}


// hooks/use-warehouse.ts
export function useLoadWarehouses() {
    const { data, error, isLoading } = useSWR<ApiResponse<WarehouseType[]>>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/warehouses`,
        fetcherWithAutoRefresh
    );

    return {
        warehouses: data?.result || [],
        loadingWarehouses: isLoading,
        warehouseError: error
    };
}


// Hook: Load inventory transactions theo warehouse code
export function useLoadInventories(codeWarehouse: string | null) {
    const { data, error, isLoading, mutate } = useSWR<
        ApiResponse<LoadInventoryTransactionResponse[]>
    >(
        codeWarehouse
            ? `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/warehouses/load-transaction/${codeWarehouse}`
            : null,
        fetcherWithAutoRefresh,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            refreshInterval: 0,
            errorRetryCount: 3,
        }
    );

    return {
        transactions: data?.result || [],
        loadingInventories: isLoading,
        inventoriesError: error,
        reloadInventories: mutate,
    };
}
