import { ModeToggle } from "@/components/toggle-mode"
import { Button } from "@/components/ui/button"
import { ListIndentDecrease, ListIndentIncrease } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PropsType } from "../../types/types";

const AdminHeader = ({ onCollapse, collapsed }: PropsType) => {
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

            <div className="flex">
                <div className="mr-2">
                    <ModeToggle />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg">Cài đặt</DropdownMenuTrigger>
                    <DropdownMenuContent className="text-center">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem> Profile</DropdownMenuItem>
                        <DropdownMenuItem> Billing</DropdownMenuItem>
                        <DropdownMenuItem> Team</DropdownMenuItem>
                        <DropdownMenuItem> Subscription</DropdownMenuItem>
                        <DropdownMenuItem> Đăng xuất</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default AdminHeader