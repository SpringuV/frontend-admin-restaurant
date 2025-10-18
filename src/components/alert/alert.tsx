import { ReactNode, useEffect, useState } from "react";
import { AlertProps, AlertStatus } from "@/lib/types";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

const iconMap: Record<AlertStatus, ReactNode> = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
};

const colorMap: Record<AlertStatus, string> = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
};
const Alert: React.FC<AlertProps> = ({ title, message, icon, type = 'info', duration = 3000, onClose }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);
    
    if (!show) return null;
    return (
        <>
            <div className="fixed z-50 right-5 top-20">
                <div className={`flex items-start gap-3 p-4 border-l-4 rounded-md shadow-md ${colorMap[type]} max-w-md w-full`}>
                    <div className="mt-1">
                        {icon ?? iconMap[type]}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm">{message}</p>
                    </div>
                    <button
                        onClick={() => { setShow(false); onClose?.(); }}
                        className="ml-2 font-bold text-lg leading-none"
                    >
                        &times;
                    </button>
                </div>
            </div>
        </>
    )
}

export default Alert;