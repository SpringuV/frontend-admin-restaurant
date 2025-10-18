import { X, Users, Clock, Calendar, User, Phone, Mail } from 'lucide-react';
import { TableType } from '../../../lib/types';

type PropsBookingType = {
    isModalOpen: boolean;
    onOpen: (val: boolean) => void;
    selectedTable: TableType | null
    onClose: () => void;
}
const ModalBooking = ({ isModalOpen, onOpen, selectedTable, onClose }: PropsBookingType) => {
    const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert(`Đặt bàn số ${selectedTable.number} thành công!`);
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
                                Đặt bàn số {selectedTable.number}
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

                            <div>
                                {/* Customer Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4" />
                                        Tên khách hàng
                                    </label>
                                    <input
                                        type="text"
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
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4" />
                                        Email (tùy chọn)
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Nhập email"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày đặt
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4" />
                                        Giờ đặt
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Number of Guests */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Users className="w-4 h-4" />
                                        Số khách
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    >
                                        {[...Array(selectedTable.capacity)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1} người
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Nhập ghi chú thêm..."
                                    />
                                </div>

                            </div>
                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBooking}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                >
                                    Xác nhận đặt bàn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ModalBooking
