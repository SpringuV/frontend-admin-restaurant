'use client'
import { ModeToggle } from "@/components/toggle-mode"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Settings, Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/hooks/user";
import { Spinner } from "@/components/ui/spinner";

interface AdminHeaderProps {
    collapsed: boolean;
    onCollapse: () => void;
    isMobile?: boolean;
}

const AdminHeader = ({ onCollapse, collapsed, isMobile }: AdminHeaderProps) => {
    const { logout, isLoading } = useLogout();
    const handleLogout = () => {
        logout()
    }
    return (
        <header className="bg-white/80 backdrop-blur-md w-full dark:bg-gray-800/80 border-b border-slate-200/50 h-16 sm:h-20 flex justify-between items-center px-3 sm:px-6 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCollapse}
                    className="text-slate-600 hover:text-purple-600 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors rounded-xl"
                >
                    {isMobile ? (
                        collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </Button>
                
                <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Welcome Message - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-700">
                        Xin chào <span className="font-semibold text-purple-600">Admin</span>
                    </span>
                </div>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-600 hover:text-purple-600 hover:bg-purple-100 dark:text-white dark:hover:bg-purple-900/30 transition-colors rounded-xl"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </Button>

                {/* Theme Toggle */}
                <div className="hidden sm:block">
                    <ModeToggle />
                </div>

                {/* Settings Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            className="gap-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all rounded-xl"
                        >
                            <Settings className="w-4 h-4 text-purple-600" />
                            <span className="hidden sm:inline text-sm font-medium">Cài đặt</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200/50 shadow-lg">
                        <DropdownMenuLabel className="text-slate-700 font-semibold">Tài khoản của tôi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-50 rounded-lg transition-colors">
                            <User className="w-4 h-4 mr-2 text-purple-600" />
                            Hồ sơ
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-50 rounded-lg transition-colors">
                            <Settings className="w-4 h-4 mr-2 text-purple-600" />
                            Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="sm:hidden cursor-pointer hover:bg-purple-50 rounded-lg transition-colors">
                            <span className="w-4 h-4 mr-2">🌓</span>
                            Chế độ tối
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <button onClick={handleLogout} className="w-full">
                            <DropdownMenuItem className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white cursor-pointer rounded-lg transition-all font-medium">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 w-full justify-center">
                                        <Spinner className="w-4 h-4" />
                                        <span>Đang đăng xuất...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 w-full">
                                        <LogOut className="w-4 h-4" />
                                        <span>Đăng xuất</span>
                                    </div>
                                )}
                            </DropdownMenuItem>
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default AdminHeader