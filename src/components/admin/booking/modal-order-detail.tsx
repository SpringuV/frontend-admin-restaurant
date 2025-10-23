'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { X, Users, User, Plus, Minus, Trash2, Edit2, Save, XCircle, Search, DollarSign, ShoppingBag, FileText, Clock } from 'lucide-react';
import { useCancelOrder, useCreateUpdateOrder, useGetOrderDetail, useLoadFoods } from '@/hooks/booking-orders';
import { Spinner } from '@/components/ui/spinner';
import { AlertProps, CreateOrderRequest, DataPropsToModalDetail, FoodItem } from '@/lib/types';
import { removeBookingFromSession } from '@/lib/session-storage-helper';
import { useConfirmDialog } from '@/hooks/hook-client';
import ConfirmDialog from '@/components/modal/confirm-dialog';
import Alert from '@/components/alert/alert';
import LoadingModal from '@/components/modal/modal-loading';

interface ModalOrderDetailProps {
    data: DataPropsToModalDetail | null
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    tableId: number;
    onReloadTables: () => void;
}

const orderStatusText: Record<string, string> = {
    READY: 'Sẵn sàng',
    PREPARING: 'Đang chuẩn bị',
    SERVED: 'Đã phục vụ',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};

const orderStatusColor: Record<string, string> = {
    READY: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-yellow-100 text-yellow-800',
    SERVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

export default function ModalOrderDetail({
    data,
    isOpen,
    onClose,
    tableId,
    orderId,
    onReloadTables
}: ModalOrderDetailProps) {
    const { getOrderDetail, orderDetail, isLoading } = useGetOrderDetail();
    const { foods, isLoading: loadingFoods, error: foodError } = useLoadFoods();
    const { createOrder: updateOrder, isLoading: isUpdating } = useCreateUpdateOrder();
    const { isOpenDialog, config, showConfirm, hideConfirm } = useConfirmDialog();
    const { cancelOrder, cancelLoading, errorCancel, dataCancel } = useCancelOrder()
    const [loadError, setLoadError] = useState(false);
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [alert, setAlert] = useState<AlertProps | null>(null)
    const [localLoading, setLocalLoading] = useState(false)
    const [textModalLoading, setTextModalLoading] = useState<string>('')

    // State cho order items (có thể chỉnh sửa)
    const [orderItems, setOrderItems] = useState<FoodItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempNote, setTempNote] = useState('');

    // State cho menu
    const [searchMenu, setSearchMenu] = useState('');
    const [currentOrderData, setCurrentOrderData] = useState<DataPropsToModalDetail | null>(null);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, alert.duration || 4000);

            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        if (isOpen && tableId) {
            // Kiểm tra xem có data từ props không và id_order có hợp lệ không
            if (data && data.id_order && data.id_order > 0) {
                // Sử dụng data từ props
                console.log('📦 Using data from props:', data);
                setCurrentOrderData(data);
                loadOrderFromData(data);
            } else {
                // Query từ DB nếu không có data hoặc id_order = 0/null
                console.log('🔍 Querying order from DB, orderId:', orderId);
                loadOrderDetail();
            }
        }
    }, [isOpen, tableId, orderId, data]);

    // Load từ data có sẵn
    const loadOrderFromData = (orderData: DataPropsToModalDetail) => {
        const items: FoodItem[] = orderData.order_item_list_response.map((item: any) => ({
            id_food: item.id_food,
            name_food: item.name_food,
            price: item.price,
            quantity: item.quantity || 1,
            note: item.note || '',
            image_url: item.image || '',
        }));
        setOrderItems(items);
    };

    // Load chi tiết order từ API
    const loadOrderDetail = async () => {
        try {
            setLoadError(false);
            console.log('🔍 Loading order detail from API:', { orderId });
            const result = await getOrderDetail(orderId);

            if (result && result.result) {
                setCurrentOrderData(result.result);
                // Convert order items từ API
                const items: FoodItem[] = result.result.order_item_list_response.map((item: any) => ({
                    id_food: item.id_food,
                    name_food: (item.name_food ?? ''),
                    price: item.price,
                    quantity: item.quantity || 1,
                    note: item.note_special || '',
                    image_url: item.image || '',
                }));
                setOrderItems(items);
            }
        } catch (err) {
            console.error('❌ Load order detail failed:', err);
            setLoadError(true);
        }
    };

    // Lấy unique food types từ API
    const foodTypes = ['Tất cả', ...Array.from(new Set(foods.map((f: FoodItem) => f.type_food)))];

    // Lọc món ăn
    const filteredFoods = foods.filter((food: FoodItem) => {
        const matchSearch = (food.name_food ?? '').toLowerCase().includes(searchMenu.toLowerCase());
        const matchType = selectedType === 'Tất cả' || food.type_food === selectedType;
        return matchSearch && matchType;
    });

    // Lọc menu theo search
    const filteredMenu = filteredFoods.filter(item =>
        (item.name_food ?? '').toLowerCase().includes(searchMenu.toLowerCase())
    );

    // Cập nhật order
    const handleUpdateOrder = async () => {
        if (!currentOrderData) {
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Không tìm thấy thông tin đơn hàng!',
                duration: 4000,
            });
            return;
        }

        try {
            // Chuẩn bị dữ liệu để update
            const updateData: CreateOrderRequest = {
                id_order: orderId,
                id_table: tableId,
                phone_number: currentOrderData.phone_cus || '',
                note_order: currentOrderData.note_order || '',
                order_status: currentOrderData.order_status as 'READY' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED',
                total_amount: calculateTotal(),
                food_items: orderItems.map((item) => ({
                    id_food: item.id_food,
                    quantity: item.quantity,
                    note: item.note,
                })),
            };

            // console.log('📤 Updating order:', updateData);

            // The hook may return either a boolean or an object; accept any and narrow safely
            await updateOrder(updateData);
            // updated successfully (optional additional handling)
            setAlert({
                title: 'Thành công',
                type: 'success',
                message: 'Cập nhật đơn hàng thành công!',
                duration: 4000,
            });


            // Cập nhật lại currentOrderData với dữ liệu mới
            setCurrentOrderData({
                ...currentOrderData,
                phone_cus: updateData.phone_number,
                note_order: updateData.note_order,
                order_status: updateData.order_status as 'READY' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED',
                total_amount: updateData.total_amount
            });

            // onReloadTables() - không reload table
            // onClose() - không đóng form

            //  Giao diện đã được cập nhật qua setCurrentOrderData
            //  Form vẫn mở, user có thể tiếp tục chỉnh sửa

        } catch (err) {
            console.error('Update order failed:', err);
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Cập nhật đơn hàng thất bại!',
                duration: 4000,
            });
        }
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // Thay đổi số lượng
    const handleQuantityChange = (index: number, delta: number) => {
        const newItems = [...orderItems];
        newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
        setOrderItems(newItems);

        // TODO: Call API to update quantity
        console.log('Update quantity:', newItems[index]);
    };

    // Xóa món
    const handleRemoveItem = (index: number) => {
        showConfirm({
            title: 'Xóa món ăn',
            message: 'Bạn có chắc muốn xóa món này?',
            confirmText: 'Xóa',
            type: 'danger',
            onConfirm: () => {
                const removedItem = orderItems[index];
                setOrderItems(orderItems.filter((_, i) => i !== index));
            }
        });
    };

    // Chỉnh sửa ghi chú
    const handleEditNote = (index: number) => {
        setEditingIndex(index);
        setTempNote(orderItems[index].note || '');
    };

    const handleSaveNote = (index: number) => {
        const newItems = [...orderItems];
        newItems[index].note = tempNote;
        setOrderItems(newItems);
        setEditingIndex(null);
        setTempNote('');

        // TODO: Call API to update note
        console.log('Update note:', newItems[index]);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setTempNote('');
    };

    // Thêm món từ menu
    const handleAddItem = (menuItem: FoodItem) => {
        const existingIndex = orderItems.findIndex((item: FoodItem) => item.id_food === menuItem.id_food);

        if (existingIndex >= 0) {
            // Nếu món đã có, tăng số lượng
            const newItems = [...orderItems];
            newItems[existingIndex].quantity += 1;
            setOrderItems(newItems);
        } else {
            // Thêm món mới
            const newItem: FoodItem = {
                ...menuItem,
                quantity: 1,
                note: '',
            };
            setOrderItems([...orderItems, newItem]);
        }

        // TODO: Call API to add item to order
        // console.log('Add item:', menuItem);
    };

    // Thanh toán
    const handlePayment = async () => {
        try {
            // TODO: Call API thanh toán
            console.log('Payment:', { orderId, tableId, total: calculateTotal() });

            setAlert({
                title: 'Thành công',
                type: 'success',
                message: 'Thanh toán thành công!',
                duration: 4000,
            });

            removeBookingFromSession(tableId);
            // onReloadTables();
            onClose();
        } catch (err) {
            console.error('❌ Payment failed:', err);
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Thanh toán thất bại!',
                duration: 4000,
            });
        }
    };

    // Hủy đơn
    const handleCancelOrder = () => {
        showConfirm({
            title: 'Hủy đơn hàng',
            message: 'Bạn có chắc muốn hủy đơn này?',
            confirmText: 'Xóa',
            type: 'danger',
            onConfirm: async () => {
                removeBookingFromSession(tableId);
                // Pass the expected request shape to the hook
                const response = await cancelOrder({ id_order: orderId });
                if (response.code == 100) {
                    setAlert({
                        title: 'Thành công',
                        type: 'success',
                        message: 'Đơn hàng đã được hủy!',
                        duration: 4000,
                    });
                    setTextModalLoading('Đang quay về trang đặt bàn')
                    setLocalLoading(true)
                    setTimeout(() => {
                        setTextModalLoading('')
                        setLocalLoading(false)
                        onClose();
                        onReloadTables();
                    }, 2000)
                } else {
                    setAlert({
                        title: 'Lỗi',
                        type: 'error',
                        message: 'Hủy đơn thất bại!',
                        duration: 4000,
                    });
                }
                // onReloadTables();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Hiển thị Alert */}
                {alert && (
                    <Alert
                        title={alert.title}
                        type={alert.type}
                        message={alert.message}
                        icon={alert.icon}
                        duration={alert.duration}
                        onClose={() => setAlert(null)}
                    />
                )}
                <LoadingModal
                    open={localLoading}
                    text={textModalLoading}
                />
                {/* Confirm Dialog */}
                <ConfirmDialog
                    isOpenDialog={isOpenDialog}
                    onClose={hideConfirm}
                    {...config}
                    onConfirm={config.onConfirm ?? (() => { })}
                />
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-7 h-7" />
                            Chi tiết order - Bàn {tableId}
                        </h2>
                        {orderDetail && (
                            <p className="text-sm opacity-90 mt-1">
                                Order ID: {currentOrderData?.id_order || orderDetail.result.id_order}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 hover:cursor-pointer rounded-lg transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                        <Spinner className="w-12 h-12" />
                        <p className="text-gray-600">Đang tải thông tin order...</p>
                    </div>
                ) : loadError || !currentOrderData ? (
                    <div className="flex-1 text-center py-12">
                        <p className="text-red-500 mb-4">❌ Không thể tải thông tin order</p>
                        <button
                            onClick={loadOrderDetail}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:cursor-pointer hover:bg-blue-600"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex">
                        {/* Left Side - Danh sách món đã order */}
                        <div className="w-1/2 border-r overflow-y-auto p-6 bg-gray-50">
                            <div className="space-y-6">
                                {/* Thông tin khách hàng */}
                                <div className="bg-white rounded-lg p-4 border shadow-sm">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Thông tin khách hàng
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-600">Tên khách hàng</p>
                                            <p className="font-semibold">{currentOrderData?.name_cus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Số điện thoại</p>
                                            <p className="font-semibold">{currentOrderData?.phone_cus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Số khách</p>
                                            <p className="font-semibold flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {currentOrderData?.sum_human} người
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Trạng thái</p>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${currentOrderData && orderStatusColor[currentOrderData.order_status]}`}>
                                                {currentOrderData && orderStatusText[currentOrderData.order_status]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin order */}
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Thông tin đơn hàng
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Thời gian tạo</p>
                                            <p className="font-semibold">
                                                {currentOrderData?.created_at
                                                    ? new Date(currentOrderData.created_at).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {currentOrderData.note_order && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600">Ghi chú</p>
                                            <p className="font-semibold italic">{currentOrderData.note_order}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Danh sách món */}
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-green-600" />
                                        Danh sách món ({orderItems.length})
                                    </h3>

                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-white border rounded-lg p-3 hover:shadow-md transition"
                                            >
                                                <div className="flex gap-3">
                                                    {/* Image */}
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name_food}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    )}

                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800">{item.name_food}</h4>
                                                        <p className="text-sm text-orange-600 font-semibold">
                                                            {item.price.toLocaleString()}đ
                                                        </p>

                                                        {/* Note */}
                                                        {editingIndex === index ? (
                                                            <div className="mt-2 flex gap-1">
                                                                <input
                                                                    type="text"
                                                                    value={tempNote}
                                                                    onChange={(e) => setTempNote(e.target.value)}
                                                                    placeholder="Ghi chú..."
                                                                    className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveNote(index)}
                                                                    className="p-1 hover:cursor-pointer text-green-600 hover:bg-green-50 rounded"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="p-1 hover:cursor-pointer text-red-600 hover:bg-red-50 rounded"
                                                                >
                                                                    <XCircle className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1 flex items-center gap-2">
                                                                {item.note ? (
                                                                    <p className="text-xs text-gray-500 italic flex-1">
                                                                        {item.note}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic flex-1">Chưa có ghi chú</p>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEditNote(index)}
                                                                    className="p-1 hover:cursor-pointer text-blue-600 hover:bg-blue-50 rounded"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity & Actions */}
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                                            <button
                                                                onClick={() => handleQuantityChange(index, -1)}
                                                                className="p-1 hover:cursor-pointer hover:bg-gray-200 rounded transition"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityChange(index, 1)}
                                                                className="p-1 hover:cursor-pointer hover:bg-gray-200 rounded transition"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-1 hover:cursor-pointer text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                        <p className="font-bold text-orange-600 text-sm">
                                                            {(item.price * item.quantity).toLocaleString()}đ
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {orderItems.length === 0 && (
                                            <div className="text-center py-8 text-gray-400 bg-white rounded-lg border">
                                                Chưa có món nào
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 sticky bottom-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5" />
                                            <span className="text-lg font-bold">Tổng cộng:</span>
                                        </div>
                                        <span className="text-2xl font-bold">
                                            {calculateTotal().toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Menu thêm món */}
                        <div className="w-1/2 overflow-y-auto p-6">
                            <div className="space-y-4">
                                <div className="sticky -top-6 bg-white py-4 z-10 shadow-sm">
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-green-600">
                                        <Plus className="w-6 h-6" />
                                        Thêm món
                                    </h3>
                                    {/* Search & Filter */}
                                    <div className="p-4 border-b space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm món ăn..."
                                                value={searchMenu}
                                                onChange={(e) => setSearchMenu(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {foodTypes.map((type: any, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedType(type)}
                                                    className={`hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === type
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Grid */}
                                {loadingFoods ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Spinner className="w-8 h-8" />
                                        <p className="text-gray-600">Đang tải menu...</p>
                                    </div>
                                ) : foodError ? (
                                    <div className="text-center text-red-500 py-12">
                                        <p>❌ Không thể tải menu. Vui lòng thử lại!</p>
                                    </div>
                                ) : filteredMenu.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <p>Không tìm thấy món ăn nào</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {filteredMenu.map((food: FoodItem) => (
                                            <button
                                                key={food.id_food}
                                                onClick={() => handleAddItem(food)}
                                                className="bg-white border-2 hover:cursor-pointer border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-lg transition text-left group"
                                            >
                                                <div className="relative overflow-hidden rounded-lg mb-2 z-0">
                                                    <img
                                                        src={food.image_url}
                                                        alt={food.name_food}
                                                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300 z-0"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                        <Plus className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-sm mb-1 line-clamp-1">{food.name_food}</h4>
                                                {food.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{food.description}</p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <p className="text-orange-600 font-bold text-sm">{food.price.toLocaleString()}đ</p>
                                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                                        {food.type_food}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {currentOrderData && !isLoading && !loadError && (
                    <div className="border-t p-6 bg-gray-50">
                        <div className="flex gap-3">
                            <button
                                type='button'
                                onClick={handleUpdateOrder}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 hover:cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật đơn hàng'}
                            </button>
                            {currentOrderData.order_status !== 'COMPLETED' && currentOrderData.order_status !== 'CANCELLED' && (
                                <>
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy đơn
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 hover:cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        💰 Thanh toán
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}