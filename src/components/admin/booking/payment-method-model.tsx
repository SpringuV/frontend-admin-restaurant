'use client';

import { X, Banknote, CreditCard, Wallet } from 'lucide-react';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

interface PaymentMethodOption {
    value: PaymentMethod;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
}

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: PaymentMethod) => void;
    selectedMethod: PaymentMethod;
    onMethodChange: (method: PaymentMethod) => void;
    totalAmount: number;
    isProcessing?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
    {
        value: 'CASH',
        label: 'Tiền mặt',
        icon: Banknote,
        color: 'bg-green-500',
        description: 'Thanh toán trực tiếp bằng tiền mặt'
    },
    {
        value: 'BANK_TRANSFER',
        label: 'Chuyển khoản',
        icon: CreditCard,
        color: 'bg-blue-500',
        description: 'Chuyển khoản qua ngân hàng'
    }
];

export default function PaymentMethodModal({
    isOpen,
    onClose,
    onConfirm,
    selectedMethod,
    onMethodChange,
    totalAmount,
    isProcessing = false
}: PaymentMethodModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(selectedMethod);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-orange-500" />
                        Chọn phương thức thanh toán
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="hover:bg-gray-100 p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethod === method.value;

                        return (
                            <button
                                key={method.value}
                                onClick={() => onMethodChange(method.value)}
                                disabled={isProcessing}
                                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isSelected
                                        ? 'border-orange-500 bg-orange-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`${method.color} p-3 rounded-lg text-white`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-800">{method.label}</p>
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                    <span className="font-semibold text-gray-700">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-orange-600">
                        {totalAmount.toLocaleString()}đ
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Xác nhận thanh toán'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}