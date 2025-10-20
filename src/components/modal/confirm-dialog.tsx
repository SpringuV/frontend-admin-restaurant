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
import { AlertTriangle } from "lucide-react";
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
            iconColor: "text-red-600",
            button: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            iconColor: "text-orange-600",
            button: "bg-orange-600 hover:bg-orange-700",
        },
        info: {
            iconColor: "text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700",
        },
    };

    const currentStyle = typeStyles[type];

    const handleConfirm = () => {
        onConfirm?.();
        onClose?.();
    };

    return (
        <Dialog open={isOpenDialog} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex items-center gap-2">
                    <AlertTriangle className={cn("w-6 h-6", currentStyle.iconColor)} />
                    <VisuallyHidden>
                        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                    </VisuallyHidden>
                </DialogHeader>

                <DialogDescription className="text-gray-700 mt-2">
                    {message}
                </DialogDescription>

                <DialogFooter className="flex gap-2 mt-6 sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            {cancelText}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleConfirm}
                        className={cn(currentStyle.button, "text-white")}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
