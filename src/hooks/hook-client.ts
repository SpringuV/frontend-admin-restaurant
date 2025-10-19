'use client'
import { ConfirmDialogProps } from "@/lib/types";
import { useState } from "react";

// Hook để sử dụng
export function useConfirmDialog() {
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});

    const showConfirm = (newConfig: Partial<ConfirmDialogProps>) => {
        setConfig(newConfig);
        setIsOpenDialog(true);
    };

    const hideConfirm = () => {
        setIsOpenDialog(false);
    };

    return {
        isOpenDialog,
        config,
        showConfirm,
        hideConfirm
    };
}