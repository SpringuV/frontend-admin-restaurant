import { Metadata } from "next";
import Booking from "@/components/admin/booking/booking-page";

export const metadata: Metadata = {
    title: 'Đặt bàn',
    description: 'Đặt bàn',
};

const BookingPage = () => {
    return <Booking />
};

export default BookingPage;