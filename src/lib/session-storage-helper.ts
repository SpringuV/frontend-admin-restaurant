import { BookingSessionInfo } from "./types";


const SESSION_BOOKINGS_KEY = 'booked_tables';

/**
 * Lưu thông tin booking vào sessionStorage
 * Lưu dạng mảng để hỗ trợ nhiều bàn
 */
export function saveBookingToSession(booking: BookingSessionInfo): void {
    try {
        const bookings = getBookingsFromSession();
        
        // Kiểm tra xem bàn đã tồn tại chưa
        const existingIndex = bookings.findIndex(b => b.id_table === booking.id_table);
        
        if (existingIndex >= 0) {
            // Update nếu đã tồn tại
            bookings[existingIndex] = booking;
        } else {
            // Thêm mới
            bookings.push(booking);
        }
        
        sessionStorage.setItem(SESSION_BOOKINGS_KEY, JSON.stringify(bookings));
        console.log('✅ Booking saved to session:', booking);
    } catch (error) {
        console.error('❌ Failed to save booking to session:', error);
    }
}

/**
 * Lấy tất cả bookings từ sessionStorage
 */
export function getBookingsFromSession(): BookingSessionInfo[] {
    try {
        const data = sessionStorage.getItem(SESSION_BOOKINGS_KEY);
        if (!data) return [];
        
        return JSON.parse(data) as BookingSessionInfo[];
    } catch (error) {
        console.error('❌ Failed to get bookings from session:', error);
        return [];
    }
}

/**
 * Tìm booking theo table ID
 */
export function getBookingByTableId(tableId: number): BookingSessionInfo | null {
    try {
        const bookings = getBookingsFromSession();
        const booking = bookings.find(b => b.id_table === tableId);
        
        if (booking) {
            console.log('📦 Found booking in session for table', tableId, ':', booking);
            return booking;
        }
        
        console.log('⚠️ No booking found in session for table', tableId);
        return null;
    } catch (error) {
        console.error('❌ Failed to get booking by table ID:', error);
        return null;
    }
}

/**
 * Xóa booking khỏi session theo table ID
 */
export function removeBookingFromSession(tableId: number): void {
    try {
        const bookings = getBookingsFromSession();
        const filtered = bookings.filter(b => b.id_table !== tableId);
        
        sessionStorage.setItem(SESSION_BOOKINGS_KEY, JSON.stringify(filtered));
        console.log('🗑️ Booking removed from session for table', tableId);
    } catch (error) {
        console.error('❌ Failed to remove booking from session:', error);
    }
}

/**
 * Xóa tất cả bookings khỏi session
 */
export function clearAllBookingsFromSession(): void {
    try {
        sessionStorage.removeItem(SESSION_BOOKINGS_KEY);
        console.log('🗑️ All bookings cleared from session');
    } catch (error) {
        console.error('❌ Failed to clear bookings from session:', error);
    }
}

/**
 * Kiểm tra xem có booking cho table này không
 */
export function hasBookingForTable(tableId: number): boolean {
    return getBookingByTableId(tableId) !== null;
}