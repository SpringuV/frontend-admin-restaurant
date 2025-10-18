/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    CalendarCheck,
    FileText,
    Package,
    SquareUser,
    ChevronDown,
    ChevronRight,
    DollarSign,
    ArrowDownCircle,
    ArrowUpCircle,
    BarChart3
} from "lucide-react";
import { PropsType } from '../../types/types';
import { useRouter } from 'next/navigation';

const AdminSideBar = ({ collapsed }: PropsType) => {
    const router = useRouter();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const handleNavigate = (path?: string) => {
        if (path) router.push(path);
    };

    const menuItems = [
        {
            id: '1',
            icon: <CalendarCheck className="w-5 h-5" />,
            path: "/booking",
            label: 'Đặt bàn',
        },
        {
            id: '2',
            icon: <FileText className="w-5 h-5" />,
            label: 'Quản lý hóa đơn',
            hasSubmenu: true,
            submenu: [
                {
                    id: '2-1',
                    icon: <FileText className="w-4 h-4" />,
                    label: 'Danh sách hóa đơn',
                    path: '/invoice',
                },
                {
                    id: '2-2',
                    icon: <DollarSign className="w-4 h-4" />,
                    label: 'Doanh thu',
                    path: '/invoice/statistic',
                }
            ]
        },
        {
            id: '3',
            icon: <Package className="w-5 h-5" />,
            label: 'Quản lý kho',
            hasSubmenu: true,
            submenu: [
                {
                    id: '3-1',
                    icon: <ArrowDownCircle className="w-4 h-4" />,
                    label: 'Nhập kho',
                    path: '/warehouse/import',
                },
                {
                    id: '3-2',
                    icon: <ArrowUpCircle className="w-4 h-4" />,
                    label: 'Xuất kho',
                    path: '/warehouse/export',
                },
                {
                    id: '3-3',
                    icon: <BarChart3 className="w-4 h-4" />,
                    label: 'Thống kê kho',
                    path: '/warehouse/statistic',
                }
            ]
        },
        {
            id: '4',
            icon: <SquareUser className="w-5 h-5" />,
            path: "/account",
            label: 'Quản lý tài khoản'
        }
    ];

    const toggleSubmenu = (itemId: string | null) => {
        if (collapsed) return;
        setOpenSubmenu(openSubmenu === itemId ? null : itemId);
    };

    return (
        <aside
            className={cn(
                'bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-700">
                <div className="text-2xl font-bold">
                    {collapsed ? <img src={'/image.png'} alt='Ảnh bún bò thumbnail' loading='lazy'/> : 'Bún Bò Ha'}
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => (
                    <div key={item.id}>
                        {/* Main Menu Item */}
                        <div
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors',
                                collapsed && 'justify-center'
                            )}
                            onClick={() =>
                                item.hasSubmenu
                                    ? toggleSubmenu(item.id)
                                    : handleNavigate(item.path)
                            }
                        >
                            <span>{item.icon}</span>
                            {!collapsed && (
                                <>
                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                    {item.hasSubmenu && (
                                        <span className="transition-transform duration-200">
                                            {openSubmenu === item.id ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Submenu */}
                        {item.hasSubmenu && !collapsed && openSubmenu === item.id && (
                            <div className="bg-slate-800/50">
                                {item.submenu.map((subItem) => (
                                    <div
                                        key={subItem.id}
                                        className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-slate-700 cursor-pointer transition-colors"
                                        onClick={() => handleNavigate(subItem.path)}
                                    >
                                        <span>{subItem.icon}</span>
                                        <span className="text-sm">{subItem.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSideBar