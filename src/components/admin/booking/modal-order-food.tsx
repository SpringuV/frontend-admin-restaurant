'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { AlertProps, CreateInvoiceRequest, CreateOrderRequest, FoodItem, ModalOrderFoodProps, SelectedFood } from '@/lib/types';
import { useCreateInvoicePayment, useCreateUpdateOrder, useLoadFoods } from '@/hooks/booking-orders';
import { useRouter } from 'next/navigation';
import PaymentMethodModal from './payment-method-model';
import { getUserIdFromStorage } from '@/lib/utils';
import Alert from '@/components/alert/alert';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export default function ModalOrderFood({ isOpen, onClose, orderInfo, onSubmit }: ModalOrderFoodProps) {
    const router = useRouter();
    const { foods, isLoading: loadingFoods, error: foodError } = useLoadFoods();
    const { createOrder, isLoading: creatingOrder } = useCreateUpdateOrder();
    const { createInvoice, isCreatingInvoice } = useCreateInvoicePayment();

    const [alert, setAlert] = useState<AlertProps | null>(null)
    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [noteOrder, setNoteOrder] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');

    const foodTypes = ['Tất cả', ...Array.from(new Set(foods.map((f: FoodItem) => f.type_food)))];

    const filteredFoods = foods.filter((food: FoodItem) => {
        const matchSearch = (food.name_food ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = selectedType === 'Tất cả' || food.type_food === selectedType;
        return matchSearch && matchType;
    });

    const totalAmount = selectedFoods.reduce((sum, food) => sum + (food.price * food.quantity), 0);

    const handleAddFood = (food: FoodItem) => {
        const existing = selectedFoods.find(f => f.id_food === food.id_food);
        if (existing) {
            setSelectedFoods(selectedFoods.map(f =>
                f.id_food === food.id_food ? { ...f, quantity: f.quantity + 1 } : f
            ));
        } else {
            setSelectedFoods([...selectedFoods, { ...food, quantity: 1, note: '' }]);
        }
    };

    const handleDecreaseQuantity = (id_food: number) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food && f.quantity > 1 ? { ...f, quantity: f.quantity - 1 } : f
        ));
    };

    const handleIncreaseQuantity = (id_food: number) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food ? { ...f, quantity: f.quantity + 1 } : f
        ));
    };

    const handleRemoveFood = (id_food: number) => {
        setSelectedFoods(selectedFoods.filter(f => f.id_food !== id_food));
    };

    const handleUpdateNote = (id_food: number, note: string) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food ? { ...f, note } : f
        ));
    };

    const handleSubmitOrder = async () => {
        if (selectedFoods.length === 0) {
            setAlert({
                title: 'Cảnh báo',
                message: 'Vui lòng chọn ít nhất một món!',
                type: 'warning'
            })
            return;
        }

        const orderData: CreateOrderRequest = {
            id_order: orderInfo.id_order,
            id_table: orderInfo.id_table,
            phone_number: orderInfo.phone_number,
            note_order: noteOrder,
            order_status: 'READY',
            total_amount: totalAmount,
            food_items: selectedFoods.map(f => ({
                id_food: f.id_food,
                quantity: f.quantity,
                note: f.note,
            })),
        };

        try {
            const result = await createOrder(orderData);
            if (result) {
                console.log("✅ Order created:", result);
                onSubmit(orderData);
            }
        } catch (error) {
            console.error("❌ Create order failed:", error);
            setAlert({
                title: 'Lỗi',
                message: 'Tạo order thất bại, vui lòng thử lại!',
                type: 'error'
            })
        }
    };

    const handleOpenPayment = () => {
        if (selectedFoods.length === 0) {
            setAlert({
                title: 'Cảnh báo',
                message: 'Vui lòng chọn ít nhất một món!',
                type: 'warning'
            })
            return;
        }
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async (paymentMethod: PaymentMethod) => {
        if (selectedFoods.length === 0) {
            setAlert({
                title: 'Cảnh báo',
                message: 'Vui lòng chọn ít nhất một món!',
                type: 'warning'
            })
            return;
        }

        try {
            // ===== BƯỚC 1: Tạo/Update Order =====
            console.log('📝 Step 1: Creating/Updating order...');

            const orderData: CreateOrderRequest = {
                id_order: orderInfo.id_order,
                id_table: orderInfo.id_table,
                phone_number: orderInfo.phone_number,
                note_order: noteOrder,
                order_status: 'READY',
                total_amount: totalAmount,
                food_items: selectedFoods.map(f => ({
                    id_food: f.id_food,
                    quantity: f.quantity,
                    note: f.note,
                })),
            };

            const orderResult = await createOrder(orderData);

            if (!orderResult) {
                throw new Error('Tạo order thất bại');
            }

            console.log('✅ Order created/updated:', orderResult);

            // ===== BƯỚC 2: Tạo Invoice với payment_method =====
            console.log('💳 Step 2: Creating invoice...');
            const invoicePaymentMethod: 'CASH' | 'BANKING' =
                paymentMethod === 'CASH' ? 'CASH' : 'BANKING';

            const invoiceData: CreateInvoiceRequest = {
                id_user: getUserIdFromStorage(),
                id_order: orderInfo.id_order,
                phone_number_cus: orderInfo.phone_number,
                payment_method: invoicePaymentMethod,
                discount: 0,
                note: noteOrder || '',
            };
            console.log(invoiceData)

            const invoiceResult = await createInvoice(invoiceData);

            if (!invoiceResult) {
                throw new Error('Tạo invoice thất bại');
            }

            console.log('✅ Invoice created:', invoiceResult.result);

            // ===== BƯỚC 3: Xử lý theo phương thức thanh toán =====

            switch (paymentMethod) {
                case 'CASH':
                    setShowPaymentModal(false);
                    console.log('💵 Cash payment - Invoice status: PAID');
                    setAlert({
                        title: 'Thành công',
                        message: 'Thanh toán tiền mặt thành công!',
                        type: 'success'
                    })
                    setTimeout(() => {

                        onSubmit(orderData);
                        onClose();
                    }, 3000)

                    break;

                case 'BANK_TRANSFER':
                    console.log('🏦 Bank transfer - Invoice status: PENDING');
                    setShowPaymentModal(false);
                    router.push(
                        `/payment?id_order=${orderInfo.id_order}&total=${totalAmount}`
                    );
                    break;
            }

        } catch (error: any) {
            console.error('❌ Payment failed:', error);
            setShowPaymentModal(false);
            if (error.message?.includes('Invoice already exists')) {
                setAlert({
                    title: 'Cảnh báo',
                    message: ' Order này đã có hóa đơn rồi!',
                    type: 'warning'
                })
            } else if (error.message?.includes('Order not found')) {
                setAlert({
                    title: 'Cảnh báo',
                    message: 'Không tìm thấy order!',
                    type: 'warning'
                })
            } else {
                setAlert({
                    title: 'Lỗi',
                    message: `❌ Thanh toán thất bại: ${error.message || 'Vui lòng thử lại!'}`,
                    type: 'error'
                })
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                {/* Hiển thị Alert */}
                {alert && (
                    <div className='z-[1000]'>
                        <Alert
                            title={alert.title}
                            type={alert.type}
                            message={alert.message}
                            icon={alert.icon}
                            duration={alert.duration}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ShoppingCart className="w-7 h-7" />
                                Order món - Bàn {orderInfo.id_table}
                            </h2>
                            <p className="text-sm opacity-90 mt-1">
                                Khách: {orderInfo.customer_name} | SĐT: {orderInfo.phone_number}
                            </p>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left: Menu */}
                        <div className="flex-1 flex flex-col border-r">
                            {/* Search & Filter */}
                            <div className="p-4 border-b space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm món ăn..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {foodTypes.map((type: any, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === type
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Food Grid */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loadingFoods ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="flex flex-col items-center gap-3">
                                            <Spinner className="w-12 h-12" />
                                            <p className="text-gray-600">Đang tải menu...</p>
                                        </div>
                                    </div>
                                ) : foodError ? (
                                    <div className="text-center text-red-500 py-12">
                                        <p>❌ Không thể tải menu. Vui lòng thử lại!</p>
                                    </div>
                                ) : filteredFoods.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <p>Không tìm thấy món ăn nào</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredFoods.map((food: FoodItem) => (
                                            <div
                                                key={food.id_food}
                                                className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                                                onClick={() => handleAddFood(food)}
                                            >
                                                <img
                                                    src={food.image_url}
                                                    alt={food.name_food}
                                                    className="w-full h-40 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                    }}
                                                />
                                                <div className="p-3">
                                                    <h3 className="font-semibold text-gray-800 line-clamp-1">{food.name_food}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{food.description}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-orange-600 font-bold">
                                                            {food.price.toLocaleString()}đ
                                                        </span>
                                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                                            {food.type_food}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Cart */}
                        <div className="w-[400px] flex flex-col bg-gray-50">
                            <div className="p-4 border-b bg-white">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Giỏ hàng ({selectedFoods.length})
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedFoods.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                        <p>Chưa có món nào</p>
                                    </div>
                                ) : (
                                    selectedFoods.map(food => (
                                        <div key={food.id_food} className="bg-white rounded-lg p-3 border">
                                            <div className="flex gap-3">
                                                <img
                                                    src={food.image_url}
                                                    alt={food.name_food}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm">{food.name_food}</h4>
                                                    <p className="text-orange-600 font-bold text-sm">
                                                        {food.price.toLocaleString()}đ
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleDecreaseQuantity(food.id_food)}
                                                            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">{food.quantity}</span>
                                                        <button
                                                            onClick={() => handleIncreaseQuantity(food.id_food)}
                                                            className="w-7 h-7 flex items-center justify-center bg-orange-500 text-white rounded hover:bg-orange-600"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveFood(food.id_food)}
                                                            className="ml-auto text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Ghi chú (VD: không hành, ít cay...)"
                                                value={food.note}
                                                onChange={(e) => handleUpdateNote(food.id_food, e.target.value)}
                                                className="w-full mt-2 px-3 py-1.5 text-sm border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t bg-white p-4 space-y-3">
                                {/* Note */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Ghi chú chung</label>
                                    <textarea
                                        value={noteOrder}
                                        onChange={(e) => setNoteOrder(e.target.value)}
                                        placeholder="Ghi chú cho đơn hàng..."
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none text-sm"
                                    />
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className="font-semibold">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {totalAmount.toLocaleString()}đ
                                    </span>
                                </div>

                                {/* Buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={onClose}
                                        disabled={creatingOrder || isCreatingInvoice}
                                        className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={creatingOrder || isCreatingInvoice || selectedFoods.length === 0}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {creatingOrder ? 'Đang xử lý...' : 'Xác nhận'}
                                    </button>
                                    <button
                                        onClick={handleOpenPayment}
                                        disabled={creatingOrder || isCreatingInvoice || selectedFoods.length === 0}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {isCreatingInvoice ? 'Đang xử lý...' : 'Thanh toán'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Modal */}
            <PaymentMethodModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handleConfirmPayment}
                selectedMethod={selectedPaymentMethod}
                onMethodChange={setSelectedPaymentMethod}
                totalAmount={totalAmount}
                isProcessing={creatingOrder || isCreatingInvoice}
            />
        </>
    );
}