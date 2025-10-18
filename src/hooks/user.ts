import { fetcher } from "@/lib/fetcher";
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

export function useLogin() {
    const { trigger, isMutating, error, data } = useSWRMutation<LoginResponse, Error, string, LoginData>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/token`, // endpoint backend của bạn
        async (url, { arg }) => {
            return fetcher(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(arg),
            });
        }
    );

    return { login: trigger, isLoading: isMutating, error, data };
}


export function useLogout() {
    const router = useRouter();

    const { trigger, isMutating, error, data } = useSWRMutation<LogoutResponse, Error, string, void>(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/logout`, // endpoint logout
        async (url) => {
            return fetcher(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    token: localStorage.getItem('token') // hoặc token bạn muốn invalid
                })
            });
        }
    );

    const logout = async () => {
        try {
            // trigger chính là hàm mà SWR cung cấp để kích hoạt mutation (gọi API).
            // Nó chưa gọi API ngay khi khai báo, mà chỉ là khai báo hàm
            // isMutating / error / data là trạng thái theo mutation khi bạn gọi trigger.
            const res = await trigger(); // gọi API logout
            if (res.result.success) {
                localStorage.removeItem('token');
                localStorage.removeItem('payload-token');
                // setTimeout(() => {
                    router.push('/login'); // redirect về login
                // }, 2000); // delay 2s
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return { logout, isLoading: isMutating, error, data };
}