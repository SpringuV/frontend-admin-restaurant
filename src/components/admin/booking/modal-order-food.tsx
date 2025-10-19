/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { useCreateUpdateOrder, useLoadFoods } from '@/hooks/order-hook';
import { CreateOrderRequest, FoodItem, ModalOrderFoodProps, SelectedFood } from '@/lib/types';


export default function ModalOrderFood({ isOpen, onClose, orderInfo, onSubmit }: ModalOrderFoodProps) {
    // Load foods từ API
    const { foods, isLoading: loadingFoods, error: foodError } = useLoadFoods();
    const { createOrder, isLoading: creatingOrder } = useCreateUpdateOrder();
    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [noteOrder, setNoteOrder] = useState('');

    // Lấy unique food types từ API
    const foodTypes = ['Tất cả', ...Array.from(new Set(foods.map((f: FoodItem) => f.type_food)))];

    // Lọc món ăn
    const filteredFoods = foods.filter((food: FoodItem) => {
        const matchSearch = (food.name_food ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = selectedType === 'Tất cả' || food.type_food === selectedType;
        return matchSearch && matchType;
    });

    // Tính tổng tiền
    const totalAmount = selectedFoods.reduce((sum, food) => sum + (food.price * food.quantity), 0);

    // Thêm món vào giỏ
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

    // Giảm số lượng
    const handleDecreaseQuantity = (id_food: number) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food && f.quantity > 1 ? { ...f, quantity: f.quantity - 1 } : f
        ));
    };

    // Tăng số lượng
    const handleIncreaseQuantity = (id_food: number) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food ? { ...f, quantity: f.quantity + 1 } : f
        ));
    };

    // Xóa món
    const handleRemoveFood = (id_food: number) => {
        setSelectedFoods(selectedFoods.filter(f => f.id_food !== id_food));
    };

    // Cập nhật ghi chú món
    const handleUpdateNote = (id_food: number, note: string) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.id_food === id_food ? { ...f, note } : f
        ));
    };

    // Submit order
    const handleSubmitOrder = async () => {
        if (selectedFoods.length === 0) {
            alert('Vui lòng chọn ít nhất một món!');
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
        // console.log("orderData: ", orderData)
        try {
            const result = await createOrder(orderData);
            if (result) {
                console.log("X Order created:", result);
                onSubmit(orderData);
            }
        } catch (error) {
            console.error("O Create order failed:", error);
            alert('Tạo order thất bại, vui lòng thử lại!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                                    disabled={creatingOrder}
                                    className="flex-1 px-4 py-2 border rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 font-medium disabled:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={creatingOrder || selectedFoods.length === 0}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500  to-orange-600 hover: hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {creatingOrder ? 'Đang xử lý...' : 'Xác nhận order'}
                                </button>
                                <button
                                    disabled={creatingOrder}
                                    className="flex-1 px-4 py-2 border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg  font-medium disabled:bg-gray-100"
                                >
                                    Thanh Toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}