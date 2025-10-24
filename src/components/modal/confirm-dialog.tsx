"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { ConfirmDialogProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function ConfirmDialog({
    isOpenDialog,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning",
}: ConfirmDialogProps) {
    const typeStyles = {
        danger: {
            icon: AlertCircle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            button: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
            border: "border-red-200",
        },
        warning: {
            icon: AlertTriangle,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            button: "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700",
            border: "border-orange-200",
        },
        info: {
            icon: Info,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            button: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
            border: "border-blue-200",
        },
    };

    const currentStyle = typeStyles[type];
    const IconComponent = currentStyle.icon;

    const handleConfirm = () => {
        onConfirm?.();
        onClose?.();
    };

    return (
        <Dialog open={isOpenDialog} onOpenChange={onClose} modal>
            <DialogContent 
                className="w-[90vw] max-w-md sm:max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 p-0"
                style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
            >
                <DialogHeader className={cn("flex flex-col items-center gap-3 p-6 border-b-2", currentStyle.border)}>
                    <div className={cn("p-4 rounded-full", currentStyle.iconBg)}>
                        <IconComponent className={cn("w-8 h-8 sm:w-10 sm:h-10", currentStyle.iconColor)} />
                    </div>
                    <VisuallyHidden>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center">
                            {title}
                        </DialogTitle>
                    </VisuallyHidden>
                </DialogHeader>

                <DialogDescription className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-center px-6 py-6 leading-relaxed">
                    {message}
                </DialogDescription>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold rounded-xl transition-all"
                        >
                            {cancelText}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleConfirm}
                        className={cn(currentStyle.button, "w-full sm:w-auto text-white font-semibold rounded-xl shadow-lg transition-all")}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
