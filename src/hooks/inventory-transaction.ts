import useSWRMutation from "swr/mutation";
import { KeyedMutator } from "swr";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";
import { ImportExportRequest } from "@/lib/types";

// Hook: Tạo giao dịch nhập/xuất kho
export interface CreateImportExportResponse {
    code: number;
    message?: string;
    result: {
        is_created: boolean;
        message: string;
    };
}

// Hook: Tạo giao dịch nhập/xuất kho

export function useCreateImportExport() {
    const mutation = useSWRMutation<
        CreateImportExportResponse,
        Error,
        string,
        ImportExportRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/warehouses`,
        async (url, { arg }) => fetcherWithAutoRefresh(url, { method: "POST", body: arg })
    );

    const { trigger, isMutating, error, data } = mutation;

    return {
        createImportExport: trigger as KeyedMutator<ImportExportRequest>,
        loading: isMutating,
        error,
        data,
    };

}