'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/booking/modal-booking.tsx

import { X, Users, User, Phone, ChevronDown } from 'lucide-react';
import { AlertProps, BookingType, TableType } from '../../../lib/types';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { ChangeEvent, useState, useEffect } from 'react';
import { getUserIdFromStorage } from '@/lib/utils';
import { useBookingTable } from '@/hooks/booking-orders';
import ModalOrderFood from './modal-order-food';
import { saveBookingToSession } from '@/lib/session-storage-helper';
import { createPortal } from 'react-dom';

type PropsBookingType = {
    isModalOpen: boolean;
    selectedTable: TableType | null;
    onClose: () => void;
    onReloadListTable: () => void;
    onAlert?: (alert: AlertProps) => void;
}

const ModalBooking = ({ isModalOpen, onAlert, onReloadListTable, selectedTable, onClose }: PropsBookingType) => {
    // State ban đầu cho form
    const initialFormState: BookingType = {
        customer_name: "",
        id_table: 0,
        phone_cus: "",
        user_id: getUserIdFromStorage() as string,
        note_booking: "",
        sum_human: 1,
    };

    const [inputData, setInputData] = useState<BookingType>(initialFormState);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [bookingResponse, setBookingResponse] = useState<any>(null);

    const { bookTable, isLoading } = useBookingTable();

    // Reset form khi modal mở hoặc table thay đổi
    useEffect(() => {
        if (isModalOpen && selectedTable) {
            setInputData({
                ...initialFormState,
                id_table: selectedTable.id_table,
                sum_human: 1, // Reset về 1 người
            });
        }
    }, [isModalOpen, selectedTable]);

    // Reset form khi đóng modal booking
    useEffect(() => {
        if (!isModalOpen) {
            setInputData(initialFormState);
        }
    }, [isModalOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputData(prev => ({
            ...prev,
            [name]: name === 'sum_human' ? Number(value) : value
        }));
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneRegex.test(inputData.phone_cus)) {
            onAlert?.({
                title: 'Lỗi',
                type: 'error',
                message: 'Số điện thoại không hợp lệ!',
                duration: 4000,
            });
            return;
        }

        if (!inputData.customer_name) {
            onAlert?.({
                title: 'Cảnh báo',
                type: 'warning',
                message: 'Vui lòng nhập tên khách hàng.',
                duration: 4000,
            });
            return;
        }

        const bookingData: BookingType = {
            id_table: selectedTable?.id_table || 0,
            customer_name: inputData.customer_name,
            phone_cus: inputData.phone_cus,
            sum_human: inputData.sum_human ?? 2,
            note_booking: inputData.note_booking,
            user_id: inputData.user_id,
        };

        try {
            const result = await bookTable(bookingData);

            if (result) {
                console.log("✅ Booking success:", result.result);
                
                setBookingResponse(result.result);

                // LƯU VÀO SESSION STORAGE
                saveBookingToSession({
                    id_table: selectedTable?.id_table || 0,
                    id_order: Number(result.result.orderBookingResponse.id_order) || 0,
                    phone_cus: result.result.customerBookingResponse.phone_number_cus || '',
                });

                // Hiện thông báo thành công
                onAlert?.({
                    title: 'Thành công',
                    type: 'success',
                    message: `Bàn số ${selectedTable?.id_table} đã được đặt.`,
                    duration: 4000,
                });

                // Reset form trước khi chuyển modal
                setInputData(initialFormState);

                // Đóng modal booking và mở modal order
                onClose();
                setShowOrderModal(true);
            }
        } catch (err) {
            console.error('❌ Booking failed:', err);
            onAlert?.({
                title: 'Lỗi',
                type: 'error',
                message: 'Đặt bàn thất bại, vui lòng thử lại!',
                duration: 4000,
            });
        }
    };

    const handleOrderSubmit = (orderData: any) => {
        console.log("✅ Order data:", orderData);

        onAlert?.({
            title: 'Thành công',
            type: 'success',
            message: 'Order món thành công!',
            duration: 4000,
        });

        // Đóng modal order và reload table
        setShowOrderModal(false);
        setBookingResponse(null); // Reset booking response
        onReloadListTable();
    };

    const handleCloseBookingModal = () => {
        // Reset form khi đóng modal
        setInputData(initialFormState);
        onClose();
    };

    const handleCloseOrderModal = () => {
        // Reset booking response và đóng modal
        setShowOrderModal(false);
        setBookingResponse(null);
    };

    if (!isModalOpen || !selectedTable) return null;

    return (
        <>
            {/* Modal Booking */}
            {createPortal(
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b-2 border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-t-2xl">
                            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                                Đặt bàn số {selectedTable?.id_table}
                            </h2>
                            <button 
                                onClick={handleCloseBookingModal} 
                                className="p-2 text-gray-500 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-semibold text-sm sm:text-base">
                                        Sức chứa: {selectedTable.capacity} người
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleBooking} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        <User className="w-4 h-4 text-purple-600" />
                                        Tên khách hàng
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={inputData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
                                        placeholder="Nhập tên khách hàng"
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        <Phone className="w-4 h-4 text-pink-600" />
                                        Số điện thoại
                                    </label>
                                    <input
                                        maxLength={10}
                                        type="tel"
                                        name="phone_cus"
                                        value={inputData.phone_cus}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        <Users className="w-4 h-4 text-rose-600" />
                                        Số khách
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between border-2 border-gray-300 dark:border-gray-600 hover:border-rose-500 dark:hover:border-rose-500 rounded-xl py-2.5 dark:bg-gray-700 dark:text-white">
                                                {inputData.sum_human} người
                                                <ChevronDown className="w-4 h-4 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" className="w-[var(--radix-dropdown-menu-trigger-width)] mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-[10000]" style={{ zIndex: 10000 }}>
                                            {[...Array(selectedTable.capacity)].map((_, i) => (
                                                <DropdownMenuItem
                                                    key={i + 1}
                                                    onClick={() => setInputData(prev => ({ ...prev, sum_human: i + 1 }))}
                                                    className="cursor-pointer !text-center flex justify-center mb-1 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 dark:from-gray-700 dark:to-gray-700 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30 rounded-lg transition-all font-medium"
                                                >
                                                    {i + 1} người
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">
                                        Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        name="note_booking"
                                        value={inputData.note_booking}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white outline-none resize-none transition-all"
                                        placeholder="Nhập ghi chú thêm..."
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3 flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseBookingModal} 
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-semibold"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all font-semibold shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Order Food */}
            {showOrderModal && bookingResponse && (
                <ModalOrderFood
                    isOpen={showOrderModal}
                    onClose={handleCloseOrderModal}
                    orderInfo={{
                        id_order: bookingResponse.orderBookingResponse.id_order,
                        id_table: bookingResponse.orderBookingResponse.id_table,
                        customer_name: bookingResponse.customerBookingResponse.name_cus,
                        phone_number: bookingResponse.customerBookingResponse.phone_number_cus,
                    }}
                    onSubmit={handleOrderSubmit}
                />
            )}
        </>
    );
};

export default ModalBooking;