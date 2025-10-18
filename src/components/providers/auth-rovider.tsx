'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [pathname]);

    const checkAuth = () => {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        } else {
            setToken(null);
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('payload-token');
        setToken(null);
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, token, logout }}>
            {children}
        </AuthContext.Provider>
    );
}