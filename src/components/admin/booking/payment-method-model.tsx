'use client';

import { X, Banknote, CreditCard, Wallet } from 'lucide-react';
import { createPortal } from 'react-dom';

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

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                        <span className="hidden sm:inline">Chọn phương thức thanh toán</span>
                        <span className="sm:hidden">Thanh toán</span>
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethod === method.value;

                        return (
                            <button
                                key={method.value}
                                onClick={() => onMethodChange(method.value)}
                                disabled={isProcessing}
                                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isSelected
                                        ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-md'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className={`${method.color} p-2.5 sm:p-3 rounded-xl text-white shadow-lg`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">{method.label}</p>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{method.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                    <span className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">Tổng thanh toán:</span>
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {totalAmount.toLocaleString()}đ
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition text-sm sm:text-base"
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
        </div>,
        document.body
    );
}