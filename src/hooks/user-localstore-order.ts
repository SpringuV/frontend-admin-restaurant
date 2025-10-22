// hooks/use-session-order.ts
import { useState, useEffect } from 'react';
import { 
    getBookingsFromSession, 
    getBookingByTableId, 
    clearAllBookingsFromSession,
} from '@/lib/session-storage-helper';
import { useGetOrderDetail } from '@/hooks/booking-orders';
import { BookingSessionInfo } from '@/lib/types';

/**
 * Hook tự động load order detail từ session storage theo tableId
 * Sử dụng khi component mount
 */
export function useSessionOrder(tableId?: number) {
    const [sessionBooking, setSessionBooking] = useState<BookingSessionInfo | null>(null);
    const [shouldFetch, setShouldFetch] = useState(false);
    
    const { getOrderDetail, orderDetail, isLoading, error } = useGetOrderDetail();

    // Load booking info từ session khi component mount
    useEffect(() => {
        if (tableId) {
            const booking = getBookingByTableId(tableId);
            if (booking) {
                console.log('📦 Found booking in session for table', tableId, ':', booking);
                setSessionBooking(booking);
                setShouldFetch(true);
            }
        }
    }, [tableId]);

    // Fetch order detail khi có sessionBooking
    useEffect(() => {
        if (shouldFetch && sessionBooking) {
            console.log('🔍 Fetching order detail with orderId:', sessionBooking.id_order);
            getOrderDetail(sessionBooking.id_order);
            setShouldFetch(false);
        }
    }, [shouldFetch, sessionBooking, getOrderDetail]);

    // Clear all sessions
    const clearAllSessions = () => {
        clearAllBookingsFromSession();
        setSessionBooking(null);
    };

    return {
        sessionBooking,
        orderDetail,
        isLoading,
        error,
        clearAllSessions,
        hasSessionBooking: sessionBooking !== null,
    };
}

/**
 * Hook đơn giản chỉ để lấy thông tin booking từ session theo tableId
 * Không tự động fetch API
 */
export function useSessionBookingInfo(tableId?: number) {
    const [bookingInfo, setBookingInfo] = useState<BookingSessionInfo | null>(null);

    useEffect(() => {
        if (tableId) {
            const booking = getBookingByTableId(tableId);
            setBookingInfo(booking);
        }
    }, [tableId]);

    const refresh = () => {
        if (tableId) {
            const booking = getBookingByTableId(tableId);
            setBookingInfo(booking);
        }
    };

    const clearAll = () => {
        clearAllBookingsFromSession();
        setBookingInfo(null);
    };

    return {
        bookingInfo,
        hasBooking: bookingInfo !== null,
        refresh,
        clearAll,
    };
}

/**
 * Hook lấy tất cả bookings từ session
 * Hữu ích cho dashboard hoặc overview page
 */
export function useAllSessionBookings() {
    const [bookings, setBookings] = useState<BookingSessionInfo[]>([]);

    useEffect(() => {
        const allBookings = getBookingsFromSession();
        setBookings(allBookings);
        console.log('📦 Loaded all bookings from session:', allBookings);
    }, []);

    const refresh = () => {
        const allBookings = getBookingsFromSession();
        setBookings(allBookings);
    };

    const clearAll = () => {
        clearAllBookingsFromSession();
        setBookings([]);
    };

    return {
        bookings,
        count: bookings.length,
        hasBookings: bookings.length > 0,
        refresh,
        clearAll,
    };
}