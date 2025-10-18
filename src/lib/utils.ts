import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PayloadToken } from "./types";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export function getUserIdFromStorage(): string | null {
    const token = localStorage.getItem("token");

    if (!token) {
        // token chưa có → trả về null
        return null;
    }

    try {
        const payload = jwtDecode<PayloadToken>(token);
        return payload.userId ?? "";
    } catch (err) {
        console.error("Invalid token:", err);
        // nếu decode thất bại → xóa token
        localStorage.removeItem("token");
        localStorage.removeItem("payload-token");
        return null;
    }
}