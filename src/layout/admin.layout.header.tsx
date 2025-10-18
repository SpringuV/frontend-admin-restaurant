'use client'
import { ModeToggle } from "@/components/toggle-mode"
import { Button } from "@/components/ui/button"
import { ListIndentDecrease, ListIndentIncrease, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PropsType } from "../lib/types";
import { useState } from "react";
import { useLogout } from "@/hooks/user";
import { Spinner } from "@/components/ui/spinner";

const AdminHeader = ({ onCollapse, collapsed }: PropsType) => {
    const { logout, isLoading } = useLogout();
    const handleLogout = () => {
        logout()
    }
    return (
        <header className="bg-white w-full dark:bg-gray-600 border-b border-gray-200 h-16 flex justify-between items-center px-3 shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onCollapse(!collapsed)}
                className="text-slate-600 hover:text-slate-900"
            >
                {collapsed ? (
                    <ListIndentIncrease className="w-5 h-5 dark:text-white border-[1px] border-white" />
                ) : (
                    <ListIndentDecrease className="w-5 h-5 dark:text-white border-[1px] border-white" />
                )}
            </Button>

            <div className="flex items-center gap-2">
                <div>Xin chào <span className="underline">abc</span></div>
                <div className="mr-2">
                    <ModeToggle />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg">Cài đặt</DropdownMenuTrigger>
                    <DropdownMenuContent className="text-center">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex justify-center"> Profile</DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-center"> Billing</DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-center"> Team</DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-center"> Subscription</DropdownMenuItem>
                        <button onClick={handleLogout}>
                            <DropdownMenuItem className="bg-red-400 hover:!bg-red-600 text-white">
                                {isLoading
                                    ? <div className="flex items-center gap-1">
                                        <Spinner className="w-3 h-3 text-red-500" />
                                        Đăng xuất
                                    </div>
                                    : <div className="flex items-center gap-1">
                                        <LogOut className="!text-white" />
                                        Đăng xuất
                                    </div>}
                            </DropdownMenuItem>
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default AdminHeader