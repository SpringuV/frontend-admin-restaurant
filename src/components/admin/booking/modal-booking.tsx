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

    return (
        <>
            {/* Modal Booking */}
            {isModalOpen && selectedTable && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-[80vw] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Đặt bàn số {selectedTable?.id_table}
                            </h2>
                            <button 
                                onClick={handleCloseBookingModal} 
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">
                                        Sức chứa: {selectedTable.capacity} người
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleBooking} className='grid grid-cols-3 gap-4'>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4" />
                                        Tên khách hàng
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={inputData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Nhập tên khách hàng"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4" />
                                        Số điện thoại
                                    </label>
                                    <input
                                        maxLength={10}
                                        type="tel"
                                        name="phone_cus"
                                        value={inputData.phone_cus}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Users className="w-4 h-4" />
                                        Số khách
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="justify-between border-gray-300 text-gray-700 w-1/2">
                                                {inputData.sum_human} người
                                                <ChevronDown className="w-4 h-4 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" className="w-[var(--radix-dropdown-menu-trigger-width)] mt-1">
                                            {[...Array(selectedTable.capacity)].map((_, i) => (
                                                <DropdownMenuItem
                                                    key={i + 1}
                                                    onClick={() => setInputData(prev => ({ ...prev, sum_human: i + 1 }))}
                                                    className="cursor-pointer !text-center flex justify-center mb-1 bg-gray-200 hover:!bg-gray-400"
                                                >
                                                    {i + 1} người
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        name="note_booking"
                                        value={inputData.note_booking}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Nhập ghi chú thêm..."
                                    />
                                </div>

                                <div className="col-span-3 flex gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseBookingModal} 
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-300"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
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