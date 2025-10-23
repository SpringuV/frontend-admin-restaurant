import {
    IngredientType,
    CreateIngredientRequest,
    UpdateIngredientRequest,
    CreateIngredientResponse,
    UpdateIngredientResponse,
    DeleteIngredientResponse,
    // DeleteIngredientMappingResponse,
    LoadIngredientsResponse,
    LoadSupplierAndIngredientResponse
} from "@/lib/types";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";

//hook: lấy danh sách nhà cung cấp và các nguyên liệu thuộc nhà cung cấp đó
export function useLoadSupplierAndIngredient() {
    const { data, error, isLoading, mutate } = useSWR<LoadSupplierAndIngredientResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients/supplier`,
        fetcherWithAutoRefresh,
        {
            revalidateOnFocus: false, // Không refresh khi focus vào tab
            revalidateOnReconnect: true, // Chỉ refresh khi reconnect
            dedupingInterval: 5000, // Dedupe requests trong 5 giây
            refreshInterval: 0, // Không tự động refresh
            errorRetryCount: 3, // Retry tối đa 3 lần khi lỗi
        }
    )

    return {
        supplier_and_ingredients: data,
        loadingSupplier: isLoading,
        supplierError: error,
        reloadSupplier: mutate
    }
}

// Hook: Lấy danh sách ingredients
export function useLoadIngredients() {
    const { data, error, isLoading, mutate } = useSWR<LoadIngredientsResponse>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`,
        fetcherWithAutoRefresh,
        {
            // Tối ưu hóa SWR để giảm số lần refresh
            revalidateOnFocus: false, // Không refresh khi focus vào tab
            revalidateOnReconnect: true, // Chỉ refresh khi reconnect
            dedupingInterval: 5000, // Dedupe requests trong 5 giây
            refreshInterval: 0, // Không tự động refresh
            errorRetryCount: 3, // Retry tối đa 3 lần khi lỗi
        }
    );

    return {
        ingredients: data?.result || [],
        isLoading,
        error,
        reload: mutate,
    };
}

// Hook: Tạo ingredient mới
export function useCreateIngredient() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        CreateIngredientResponse,
        Error,
        string,
        CreateIngredientRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`,
        async (url, { arg }) => fetcherWithAutoRefresh(url, { method: "POST", body: arg }),
        {
            // Tự động refresh cache sau khi tạo thành công
            onSuccess: () => {
                // Invalidate cache để refresh danh sách ingredients
                mutate(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`);
            }
        }
    );

    return {
        createIngredient: trigger,
        isLoading: isMutating,
        error,
        data,
    };
}

// Hook: Cập nhật ingredient
export function useUpdateIngredient() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        UpdateIngredientResponse,
        Error,
        string,
        UpdateIngredientRequest
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`,
        async (url, { arg }) => {
            // Code trong useSWRMutation tách riêng: // id_ingredient = 123 - updateData = { name: "Thịt bò Úc", price: 200000 }
            const { id_ingredient, ...updateData } = arg;
            return fetcherWithAutoRefresh(`${url}/${id_ingredient}`, {
                method: "PATCH",
                body: updateData
            });
        },
        {
            // Tự động refresh cache sau khi cập nhật thành công
            onSuccess: () => {
                mutate(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`);
            }
        }
    );

    return {
        updateIngredient: trigger,
        isLoading: isMutating,
        error,
        data,
    };
}

// Hook: Xóa ingredient và mapping
export function useDeleteIngredient() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        DeleteIngredientResponse,
        Error,
        string,
        string // id_ingredient
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`,
        async (url, { arg: id_ingredient }) => {
            // Gọi API delete mapping trước
            // const mappingResponse = await fetcherWithAutoRefresh(`${url}/${id_ingredient}/mapping`, { 
            //     method: "DELETE" 
            // }) as DeleteIngredientResponse;

            // Sau đó gọi API delete ingredient
            const ingredientResponse = await fetcherWithAutoRefresh(`${url}/${id_ingredient}`, {
                method: "DELETE"
            }) as DeleteIngredientResponse;

            // Trả về response kết hợp
            return {
                code: ingredientResponse.code,
                message: ingredientResponse.message,
                result: {
                    is_deleted: ingredientResponse.result.is_deleted,
                    message: ingredientResponse.result.message,
                    // mapping_deleted: mappingResponse.result?.is_deleted || false
                }
            };
        },
        {
            // Tự động refresh cache sau khi xóa thành công
            onSuccess: () => {
                mutate(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`);
            }
        }
    );

    return {
        deleteIngredient: trigger,
        isLoading: isMutating,
        error,
        data,
    };
}

// Hook: Lấy chi tiết ingredient theo ID
export function useGetIngredientDetail() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        { code: number; message: string; result: IngredientType },
        Error,
        string,
        string // id_ingredient
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/ingredients`,
        async (url, { arg: id_ingredient }) => {
            return fetcherWithAutoRefresh(`${url}/${id_ingredient}`, {
                method: "GET"
            });
        }
    );

    return {
        getIngredientDetail: trigger,
        ingredientDetail: data?.result,
        isLoading: isMutating,
        error,
    };
}
