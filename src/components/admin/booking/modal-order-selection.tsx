import { TableOrderDetailResponse } from '@/lib/types';
import { X, Clock, Users, ShoppingBag } from 'lucide-react';

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
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Chọn Order - Bàn {tableId}
                        </h2>
                        <p className="text-sm opacity-90 mt-1">
                            {order ? 'Bàn này có 1 order' : 'Chưa có order nào'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-lg transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!order ? (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-30" />
                            <p>Không có order nào</p>
                        </div>
                    ) : (
                        <div
                            onClick={() => onSelectOrder(order.result.id_order)}
                            className="border-2 rounded-lg p-5 hover:shadow-lg transition cursor-pointer hover:border-purple-500 bg-white"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {order.result.id_order}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${orderStatusColor[order.result.order_status]}`}>
                                            {orderStatusText[order.result.order_status]}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Khách: <span className="font-semibold">{order.result.name_cus}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {order.result.total_amount.toLocaleString()}đ
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
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
                                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
                                >
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
