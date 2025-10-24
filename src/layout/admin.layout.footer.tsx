'use client'

import { Heart, Code } from 'lucide-react';

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();
    const teamMembers = [
        'Trần Xuân Vũ',
        'Vũ Minh Đức',
        'Nghiêm Bích Ngọc',
        'Trương Anh Quân',
        'Nguyễn Hồng Ngọc'
    ];

    return (
        <footer className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-t border-slate-200/50 shadow-inner backdrop-blur-sm">
            <div className="px-4 py-3 sm:py-4">
                {/* Desktop View */}
                <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Code className="w-4 h-4 text-purple-600" />
                        <span>Phát triển bởi</span>
                        <span className="font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                            {teamMembers.join(', ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>© {currentYear}</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        </span>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col items-center gap-2 text-xs sm:text-sm text-slate-600 text-center">
                    <div className="flex items-center gap-2">
                        <Code className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        <span className="font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                            Group Development Team
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>© {currentYear}</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}