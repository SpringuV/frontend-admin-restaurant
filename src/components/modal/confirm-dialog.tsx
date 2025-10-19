import { ConfirmDialogProps } from '@/lib/types';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
    isOpenDialog,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning'
}: ConfirmDialogProps) {
    if (!isOpenDialog) return null;

    const typeStyles = {
        danger: {
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            bg: 'bg-orange-50',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            button: 'bg-orange-600 hover:bg-orange-700'
        },
        info: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const currentStyle = typeStyles[type];

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`${currentStyle.bg} p-6 rounded-t-xl border-b`}>
                    <div className="flex items-start gap-4">
                        <div className={`${currentStyle.iconBg} p-3 rounded-full flex-shrink-0`}>
                            <AlertTriangle className={`w-6 h-6 ${currentStyle.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-base leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-xl flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-2.5 ${currentStyle.button} text-white rounded-lg font-medium transition shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}