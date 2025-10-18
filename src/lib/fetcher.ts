// lib/fetcher.ts
export const fetcher = (url: string, options?: RequestInit) =>
    fetch(url, options).then(async res => {
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error');
        }
        return res.json();
    });
