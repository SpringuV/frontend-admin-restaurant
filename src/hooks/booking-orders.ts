import { BookingType } from "@/lib/types";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";

interface GuestTable {
    id_table: number;
    capacity: number;
    type: 'VIP' | 'NORMAL';
    available: boolean;
}

interface LoadTableResponse {
    result: GuestTable[]
}

interface TakeBookingTableResponse {
    result: {
        customerBookingResponse: {
            phone_number_cus: string;
            name_cus: string;
        },
        orderBookingResponse: {
            id_order: string;
            note_order: string;
            order_status: string;
            created_at: string;
            table_id_list: number[];
        }
    }
}


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
        TakeBookingTableResponse,
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