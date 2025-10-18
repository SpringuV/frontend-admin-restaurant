/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FetcherOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    token?: string | null; // override token hoặc null để bỏ token
}

export const fetcher = async (url: string, options?: FetcherOptions) => {
    // Lấy token: ưu tiên token từ options, nếu null thì bỏ, nếu undefined thì lấy localStorage
    let token: string | null | undefined = options?.token;
    if (token === undefined) {
        token = localStorage.getItem('token');
    }

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
    };

    const res = await fetch(url, {
        method: options?.method || 'GET',
        headers: defaultHeaders,
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Error');
    }

    return data;
};
/*
export const fetcher = ...
    Đây là một hàm tiện ích dùng chung để gọi API.
url → endpoint của API.
options → các tuỳ chọn fetch như method, headers, body, …
fetch(url, options)
    Gọi API tới url với các option nếu có.
    Trả về Response object.
.then(async res => {...})
    Khi fetch xong, lấy res (response).
    res.ok → kiểm tra HTTP status code có trong khoảng 200–299.
if (!res.ok) {... throw new Error(...) }
    Nếu API trả lỗi (404, 500, …), hàm sẽ ném lỗi.
res.json() đọc body JSON chứa thông báo lỗi.
err.message || 'Error' → dùng message từ backend hoặc mặc định 'Error'.
return res.json()
    Nếu không lỗi, trả về body JSON.
    Thường là dữ liệu bạn muốn xử lý (danh sách bàn, token, v.v).
 
*/