import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PayloadToken } from "./types";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
/*
1.........clsx(inputs) - clsx("p-2", false && "bg-red-500", "text-sm") // 👉 "p-2 text-sm"
Thư viện clsx giúp gộp nhiều class name lại thành một chuỗi duy nhất, đồng thời bỏ qua những giá trị false, null, undefined, 0, v.v.
2.........twMerge(...) - twMerge("p-2 p-4") // 👉 "p-4"
Thư viện tailwind-merge có nhiệm vụ xử lý xung đột class Tailwind.
→ Nếu bạn có hai class trùng nhóm (ví dụ p-2 và p-4), nó sẽ giữ lại class sau cùng hợp lệ nhất:
*/

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