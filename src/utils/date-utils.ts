/**
 * Utility functions for date formatting
 */

/**
 * Format Instant from Java backend to Vietnamese locale
 * Java Instant can be in different formats:
 * 1. Unix timestamp with nanoseconds: "1761098312.024365"
 * 2. ISO string: "2024-01-15T10:30:00Z"
 * @param instantValue - Instant value from Java (string or number)
 * @returns Formatted date string in Vietnamese locale
 */
export function formatInstantToVietnamese(instantValue: string | number | null | undefined): string {
    if (!instantValue) {
        return 'Chưa có thông tin';
    }
    
    try {
        let date: Date;
        
        // Check if it's a Unix timestamp with nanoseconds (e.g., "1761098312.024365")
        if (typeof instantValue === 'string' && instantValue.includes('.')) {
            // Convert Unix timestamp with nanoseconds to milliseconds
            const timestamp = parseFloat(instantValue);
            date = new Date(timestamp * 1000);
        } else if (typeof instantValue === 'number') {
            // If it's already a number, treat as Unix timestamp
            date = new Date(instantValue * 1000);
        } else if (typeof instantValue === 'string') {
            // Try to parse as ISO string or regular timestamp
            const parsed = parseFloat(instantValue);
            if (!isNaN(parsed)) {
                // It's a numeric string
                date = new Date(parsed * 1000);
            } else {
                // It's an ISO string
                date = new Date(instantValue);
            }
        } else {
            return 'Định dạng không hỗ trợ';
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (error) {
        console.error('Error formatting instant:', error, 'Value:', instantValue);
        return 'Lỗi định dạng ngày';
    }
}

/**
 * Format Instant to relative time (e.g., "2 giờ trước")
 * @param instantValue - Instant value from Java (string or number)
 * @returns Relative time string in Vietnamese
 */
export function formatInstantToRelative(instantValue: string | number | null | undefined): string {
    if (!instantValue) {
        return 'Chưa có thông tin';
    }
    
    try {
        let date: Date;
        
        // Check if it's a Unix timestamp with nanoseconds (e.g., "1761098312.024365")
        if (typeof instantValue === 'string' && instantValue.includes('.')) {
            const timestamp = parseFloat(instantValue);
            date = new Date(timestamp * 1000);
        } else if (typeof instantValue === 'number') {
            date = new Date(instantValue * 1000);
        } else if (typeof instantValue === 'string') {
            const parsed = parseFloat(instantValue);
            if (!isNaN(parsed)) {
                date = new Date(parsed * 1000);
            } else {
                date = new Date(instantValue);
            }
        } else {
            return 'Định dạng không hỗ trợ';
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        } else {
            return formatInstantToVietnamese(instantValue);
        }
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return 'Lỗi định dạng ngày';
    }
}

/**
 * Format Instant to date only (without time)
 * @param instantValue - Instant value from Java (string or number)
 * @returns Date string in Vietnamese format
 */
export function formatInstantToDateOnly(instantValue: string | number | null | undefined): string {
    if (!instantValue) {
        return 'Chưa có thông tin';
    }
    
    try {
        let date: Date;
        
        // Check if it's a Unix timestamp with nanoseconds (e.g., "1761098312.024365")
        if (typeof instantValue === 'string' && instantValue.includes('.')) {
            const timestamp = parseFloat(instantValue);
            date = new Date(timestamp * 1000);
        } else if (typeof instantValue === 'number') {
            date = new Date(instantValue * 1000);
        } else if (typeof instantValue === 'string') {
            const parsed = parseFloat(instantValue);
            if (!isNaN(parsed)) {
                date = new Date(parsed * 1000);
            } else {
                date = new Date(instantValue);
            }
        } else {
            return 'Định dạng không hỗ trợ';
        }
        
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (error) {
        console.error('Error formatting date only:', error);
        return 'Lỗi định dạng ngày';
    }
}
