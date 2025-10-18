/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Login from "@/components/auth/login";
import { useAuth } from "@/components/providers/auth-rovider";
import { Spinner } from "@/components/ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";


const LoginPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Nếu đã đăng nhập, redirect về trang ban đầu hoặc admin
        if (!isLoading && isAuthenticated) {
            const redirectUrl = searchParams.get('redirect') || '/admin';
            router.push(redirectUrl);
        }
    }, [isAuthenticated, isLoading, router, searchParams]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner className="w-12 h-12" />
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Đã redirect
    }

    return <Login />;
};

export default LoginPage;