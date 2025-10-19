/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadToken } from "@/lib/types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { fetcherWithAutoRefresh } from "./fetcher-with-auto-refresh";

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

/** ==== Login Hook ==== */
export function useLogin() {
    const { trigger, isMutating, error, data } = useSWRMutation<
        LoginResponse,
        Error,
        string,
        LoginData
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/token`,
        async (url, { arg }) => {
            // Login không cần token, dùng fetch thông thường
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(arg),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Lưu token sau khi login thành công
            if (data.result?.token) {
                localStorage.setItem("token", data.result.token);

                // Giải mã và lưu payload
                const payload = jwtDecode<PayloadToken>(data.result.token);
                if (payload) {
                    localStorage.setItem("payload-token", JSON.stringify(payload));
                }
            }

            return data;
        }
    );

    return { login: trigger, isLoading: isMutating, error, data };
}

/** ==== Logout Hook ==== */
export function useLogout() {
    const router = useRouter();

    const { trigger, isMutating, error, data } = useSWRMutation<
        LogoutResponse,
        Error,
        string,
        void
    >(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/logout`,
        async (url) => {
            // Logout cần token, dùng fetcherWithAutoRefresh
            return fetcherWithAutoRefresh<LogoutResponse>(url, {
                method: "POST",
                body: { token: localStorage.getItem("token") }
            });
        }
    );

    const logout = async () => {
        try {
            const res = await trigger();

            if (res?.result?.success) {
                console.log("✅ Logout successful");
            }
        } catch (err) {
            console.error("❌ Logout failed:", err);
        } finally {
            // Dù logout API thành công hay thất bại, vẫn xóa token local
            localStorage.removeItem("token");
            localStorage.removeItem("payload-token");
            router.push("/login");
        }
    };

    return { logout, isLoading: isMutating, error, data };
}