'use client'

import { AtSign } from 'lucide-react';

export default function AdminFooter() {
    return (
        <footer className="w-full h-16 bg-gray-100 flex items-center justify-center shadow-inner">
            <p className="text-gray-700 text-sm flex items-center gap-1">
                Phát triển bởi Trần Xuân Vũ, Vũ Minh Đức, Nghiêm Bích Ngọc, Trương Anh Quân, Nguyễn Hồng Ngọc&nbsp;
                <span className="flex items-center gap-1">
                    <span className="text-xs align-super">®</span>
                    Group
                </span>
            </p>
        </footer>
    )
}