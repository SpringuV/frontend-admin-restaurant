'use client'

import { FC } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface LoadingModalProps {
    open: boolean;
    text?: string;
}

const LoadingModal: FC<LoadingModalProps> = ({ open, text = "Đang tải..." }) => {
    return (
        <Dialog
            open={open}
            onOpenChange={() => { }} // chặn việc click ngoài hoặc Escape
            modal
        >
            <DialogContent 
                className="w-[90vw] max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-0 p-8 [&>button]:hidden" 
                style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
            >
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Spinner className="relative w-16 h-16 sm:w-20 sm:h-20 text-purple-600" />
                    </div>
                    <p className="text-center font-semibold text-base sm:text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {text}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default LoadingModal;
