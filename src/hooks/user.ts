/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetcher, FetcherOptions } from "@/lib/fetcher";
import { PayloadToken } from "@/lib/types";
import { url } from "inspector";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";

interface LoginData {
    username: string;
    password: string;
}

interface LogoutResponse {
    result: {
        success: boolean;
        message?: string;
    }
}

interface LoginResponse {
    result: {
        authenticated: boolean;
        token: string;
    }
}

interface RefreshTokenType {
    result: {
        token: string;
        authenticated: boolean;
    }
}

/** ==== Login Hook ==== */
export function useLogin() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        LoginResponse,
        Error,
        string,
        LoginData
    >(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/token`, async (url, { arg }) => {
        return fetcher(url, { method: "POST", body: arg });
    });

    return { login: trigger, isLoading: isMutating, error, data };
}

/** ==== Refresh Token Hook ==== */
export function useRefreshToken() {
    const router = useRouter();

    const { trigger, isMutating, error, data } = useSWRMutation<
        RefreshTokenType,
        Error,
        string
    >(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/refresh`, async (url) => {
        const oldToken = localStorage.getItem("token");
        if (!oldToken) throw new Error("No token found in localStorage");

        const res = await fetcher(url, { method: "POST", body: { token: oldToken } });

        if (res.result?.token) {
            localStorage.setItem("token", res.result.token);

            const payload = jwtDecode<PayloadToken>(res.result.token);
            if (payload) {
                localStorage.setItem("payload-token", JSON.stringify(payload));
            }
        } else {
            // Nếu refresh thất bại → xoá token
            localStorage.removeItem("token");
            localStorage.removeItem("payload-token");
            router.push("/login");
        }

        return res;
    });

    return { refreshToken: trigger, isLoading: isMutating, error, data };
}



/*
Wrapper fetcher: tự động refresh token khi backend trả lỗi 103
refreshTokenFn là hàm trigger từ hook useRefreshToken.
Nếu token hết hạn, fetcher gọi refreshTokenFn → lưu token mới → retry request.
Nếu lỗi khác, ném ra luôn.
 */

export const fetcherWithRefresh = async <T>(
    url: string,
    options?: FetcherOptions,
    refreshTokenFn?: () => Promise<any>
): Promise<T> => {
    try {
        return await fetcher(url, options) as T;
    } catch (err: any) {
        // Lỗi token hết hạn
        if (err.message === "103" && refreshTokenFn) {
            await refreshTokenFn(); // refresh token
            // retry request sau khi refresh
            return await fetcher(url, options) as T;
        }
        throw err;
    }
};

/** ==== Logout Hook ==== */
export function useLogout() {
    const router = useRouter();

    const { trigger, isMutating, error, data } = useSWRMutation<
        LogoutResponse,
        Error,
        string,
        void
    >(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/logout`, async (url) => {
        return fetcher(url, { method: "POST", body: { token: localStorage.getItem("token") } });
    });

    const logout = async () => {
        try {
            const res = await trigger();
            if (res.result.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("payload-token");
                router.push("/login");
            }
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return { logout, isLoading: isMutating, error, data };
}