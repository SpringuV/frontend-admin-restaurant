/* eslint-disable @typescript-eslint/no-explicit-any */
import Login from "@/components/auth/login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Đăng nhập',
    description: 'Đăng nhập vào hệ thống',
};

const LoginPage = () => {
    return <Login />;
};

export default LoginPage;