'use client'

import { FC } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner"; // bạn cần có Spinner từ Shadcn UI hoặc tự custom

interface LoadingModalProps {
    open: boolean;
    text?: string;
}

const LoadingModal: FC<LoadingModalProps> = ({ open, text = "Đang tải..." }) => {
    return (
        <Dialog
            open={open}
            onOpenChange={() => { }} // chặn việc click ngoài hoặc Escape
        >
            <DialogContent className="flex flex-col items-center justify-center gap-4 w-80 p-6 bg-white rounded-xl shadow-lg [&>button]:hidden" >
                <Spinner className="w-12 h-12 text-red-500" />
                <p className="text-center text-gray-700 font-medium">{text}</p>
            </DialogContent>
        </Dialog>
    );
}

export default LoadingModal;
