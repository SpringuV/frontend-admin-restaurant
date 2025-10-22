/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { PayloadToken } from "@/lib/types";
import { FetcherOptions } from "@/lib/fetcher";

/**
 * Hàm xử lý logout và redirect
 */
function handleLogout() {
    console.log("🚪 Logging out and redirecting to login...");
    
    // Xóa token
    localStorage.removeItem("token");
    localStorage.removeItem("payload-token");
    
    // Redirect về login
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

/**
 * Hàm refresh token toàn cục
 * Trả về token mới hoặc logout
 */
async function refreshToken(): Promise<string | null> {
    const oldToken = localStorage.getItem("token");
    if (!oldToken) {
        console.error("❌ No token found for refresh");
        handleLogout();
        return null;
    }

    try {
        console.log("🔄 Refreshing token...");
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: oldToken }),
        });

        const data = await res.json();

        // Kiểm tra response
        if (!res.ok || !data.result?.token) {
            console.error("❌ Refresh token failed:", data);
            handleLogout();
            return null;
        }

        // Lưu token mới
        const newToken = data.result.token;
        localStorage.setItem("token", newToken);

        // Giải mã payload và lưu
        const payload = jwtDecode<PayloadToken>(newToken);
        if (payload) {
            localStorage.setItem("payload-token", JSON.stringify(payload));
        }

        console.log("✅ Token refreshed successfully");
        return newToken;
        
    } catch (error) {
        console.error("❌ Refresh token error:", error);
        handleLogout();
        return null;
    }
}

/**
 * Fetcher toàn cục tự động refresh token
 * Nếu backend trả về { code: 103 } → refresh token và retry request
 * Hàm này là một fetch wrapper thông minh, dùng để:
    Gắn token vào header,
    Tự động refresh token nếu bị hết hạn (code === 103),
    Retry lại request một lần sau khi có token mới.
    Luồng hoạt động tóm tắt:
    Gọi fetch() → gắn Authorization: Bearer <token>
    Nếu response JSON có code === 103 → token hết hạn
    Gọi refreshToken() để lấy token mới
    Nếu refresh thành công → retry lại request ban đầu chỉ 1 lần
    Nếu refresh thất bại → handleLogout() để logout và redirect login
    Trả về dữ liệu (data) nếu thành công.
    💡 retry = true đảm bảo chỉ thử lại 1 lần duy nhất để tránh vòng lặp vô hạn.
 */
export const fetcherWithAutoRefresh = async <T>(
    url: string,
    options?: FetcherOptions,
    retry = true // kiểm soát retry chỉ 1 lần
): Promise<T> => {
    // Lấy token
    let token: string | null | undefined = options?.token;
    if (token === undefined) {
        token = localStorage.getItem('token');
    }

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
    };

    try {
        const res = await fetch(url, {
            method: options?.method || 'GET',
            headers: defaultHeaders,
            body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await res.json();

        // ⚠️ QUAN TRỌNG: Kiểm tra code === 103 (token hết hạn)
        if (data.code === 103 && retry) {
            console.log("⚠️ Token expired (code 103), attempting refresh...");

            // Thử refresh token
            const newToken = await refreshToken();
            
            // Nếu refresh thất bại (null) → đã redirect trong refreshToken()
            if (!newToken) {
                throw new Error("Session expired. Redirecting to login...");
            }

            // Nếu refresh thành công → retry request với token mới
            console.log("🔁 Retrying request with new token...");
            return fetcherWithAutoRefresh<T>(url, options, false);
        }

        // Kiểm tra lỗi HTTP khác
        if (!res.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data as T;
        
    } catch (err: any) {
        console.error("❌ Fetcher error:", err);
        
        // Nếu là lỗi session expired, đảm bảo redirect
        if (err.message?.includes("Session expired")) {
            handleLogout();
        }
        
        throw err;
    }
};