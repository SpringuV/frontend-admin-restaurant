'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '../providers/auth-rovider';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Lưu URL hiện tại để redirect sau khi login
            const redirectUrl = `${pathname}${window.location.search}`;
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Hiển thị loading khi đang check auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="w-12 h-12" />
                    <p className="text-gray-600">Đang kiểm tra xác thực...</p>
                </div>
            </div>
        );
    }

    // Nếu chưa đăng nhập, không render gì (đã redirect ở useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // Nếu đã đăng nhập, render children
    return <>{children}</>;
}