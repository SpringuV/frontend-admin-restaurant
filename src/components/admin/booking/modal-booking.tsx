'use client'
import { X, Users, User, Phone, ChevronDown } from 'lucide-react';
import { BookingType, TableType } from '../../../lib/types';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { ChangeEvent, useState } from 'react';
import { getUserIdFromStorage } from '@/lib/utils';
import { useBookingTable } from '@/hooks/booking-orders';

type PropsBookingType = {
    isModalOpen: boolean;
    // onOpen: (val: boolean) => void;
    selectedTable: TableType | null
    onClose: () => void;
}
const ModalBooking = ({ isModalOpen, selectedTable, onClose }: PropsBookingType) => {
    const [inputData, setInputData] = useState<BookingType>({
        customer_name: "",
        id_table: selectedTable?.id_table || 0,
        phone_cus: "",
        user_id: getUserIdFromStorage() as string,
        note_booking: "",
        sum_human: 1,
        type: selectedTable?.type || 'NORMAL'
    });
    const { bookTable, isLoading, error, data } = useBookingTable();

    // Cập nhật state chung
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputData(prev => ({
            ...prev,
            [name]: name === 'sum_human' ? Number(value) : value
        }));
    };

    const handleBooking = async(e: React.FormEvent) => {
        e.preventDefault();
        // Validate phone: phải bắt đầu bằng 0 và chỉ chứa số
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneRegex.test(inputData.phone_cus)) {
            alert('Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và có 10–11 số.');
            return;
        }

        if (!inputData.customer_name) {
            alert('Vui lòng nhập tên khách hàng.');
            return;
        }
        const bookingData: BookingType = {
            id_table: selectedTable?.id_table || 0,
            customer_name: inputData.customer_name,
            phone_cus: inputData.phone_cus,
            sum_human: inputData.sum_human ?? 2,
            note_booking: inputData.note_booking,
            user_id: inputData.user_id,
            type: inputData.type
        };

        const result = await bookTable(bookingData);
        if (result) {
            console.log("Booking success:", result.result);
            alert("Đặt bàn thành công!");
            onClose();
        } else {
            alert(error?.message || "Đặt bàn thất bại");
        }
        alert(`Đặt bàn số ${selectedTable?.id_table} thành công!`);
        onClose()
    };
    return (
        <>
            {/* Modal */}
            {isModalOpen && selectedTable && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-[80vw] max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Đặt bàn số {selectedTable?.id_table}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Table Info */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">
                                        Sức chứa: {selectedTable.capacity} người
                                    </span>
                                </div>
                            </div>

                            {/* Customer Name */}
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

                                {/* Phone */}
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

                                {/* Number of Guests */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Users className="w-4 h-4" />
                                        Số khách
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className=" justify-between border-gray-300 text-gray-700 w-1/2"
                                            >
                                                {inputData.sum_human} người
                                                <ChevronDown className="w-4 h-4 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            side="bottom"
                                            className="w-[var(--radix-dropdown-menu-trigger-width)] mt-1">
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
                                {/* Table Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        Loại bàn
                                    </label>
                                    <div className="flex justify-center w-full gap-4">
                                        {['VIP', 'NORMAL'].map((type) => (
                                            <label key={type} className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={inputData.type === type}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 bg-blue-600"
                                                />
                                                <span className="text-gray-700">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* Note */}
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
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                    >
                                        Xác nhận đặt bàn
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ModalBooking
