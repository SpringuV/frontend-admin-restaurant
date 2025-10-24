import { TableOrderDetailResponse } from '@/lib/types';
import { X, Clock, Users, ShoppingBag } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalOrderSelectionProps {
    isOpen: boolean;
    onClose: () => void;
    order: TableOrderDetailResponse | null;
    tableId: number;
    onSelectOrder: (orderId: number) => void;
}

const orderStatusText = {
    READY: 'Sẵn sàng',
    PREPARING: 'Đang chuẩn bị',
    SERVED: 'Đã phục vụ',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};

const orderStatusColor = {
    READY: 'bg-blue-100 text-blue-800 border-blue-300',
    PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SERVED: 'bg-green-100 text-green-800 border-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

export default function ModalOrderSelection({
    isOpen,
    onClose,
    order,
    tableId,
    onSelectOrder
}: ModalOrderSelectionProps) {
    if (!isOpen) return null;
    
    return createPortal(
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">
                            Chọn Order - Bàn {tableId}
                        </h2>
                        <p className="text-xs sm:text-sm opacity-90 mt-1">
                            {order ? 'Bàn này có 1 order' : 'Chưa có order nào'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-xl transition"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {!order ? (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-30" />
                            <p className="text-sm sm:text-base">Không có order nào</p>
                        </div>
                    ) : (
                        <div
                            onClick={() => onSelectOrder(order.result.id_order)}
                            className="border-2 rounded-xl p-4 sm:p-5 hover:shadow-lg transition cursor-pointer hover:border-purple-500 bg-white dark:bg-gray-700"
                        >
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">
                                            {order.result.id_order}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${orderStatusColor[order.result.order_status]}`}>
                                            {orderStatusText[order.result.order_status]}
                                        </span>
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Khách: <span className="font-semibold">{order.result.name_cus}</span>
                                    </p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        {order.result.total_amount.toLocaleString()}đ
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t gap-3">
                                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{order.result.sum_human} người</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{order.result.order_item_list_response.length} món</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{
                                            order.result.created_at != null
                                                ? new Date(order.result.created_at).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'
                                        }</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectOrder(order.result.id_order);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 text-sm font-medium transition-all shadow-lg"
                                >
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-all text-sm sm:text-base"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
