/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    CalendarCheck,
    FileText,
    ChevronDown,
    ChevronRight,
    DollarSign,
    ArrowDownCircle,
    BarChart3,
    Users,
    UserPlus,
    Layers,
    ClipboardList,
    Warehouse
} from "lucide-react";
import { PropsType } from '../lib/types';
import { usePathname, useRouter } from 'next/navigation';

const AdminSideBar = ({ collapsed }: PropsType) => {
    const router = useRouter();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const path_name = usePathname()

    const handleNavigate = (path?: string, parentId?: string) => {
        if (!path) return;
        router.push(path);
        if (parentId) setOpenSubmenu(parentId);
    };

    const menuItems = [
        {
            id: "1",
            icon: <CalendarCheck className="w-5 h-5" />,
            path: "/booking",
            label: "Đặt bàn",
        },
        {
            id: "2",
            icon: <ClipboardList className="w-5 h-5" />,
            label: "Quản lý hóa đơn",
            hasSubmenu: true,
            submenu: [
                {
                    id: "2-1",
                    icon: <FileText className="w-4 h-4" />,
                    label: "Danh sách hóa đơn",
                    path: "/invoice",
                },
                {
                    id: "2-2",
                    icon: <DollarSign className="w-4 h-4" />,
                    label: "Doanh thu",
                    path: "/invoice/statistic",
                },
            ],
        },
        {
            id: "3",
            icon: <Warehouse className="w-5 h-5" />,
            label: "Quản lý kho",
            hasSubmenu: true,
            submenu: [
                {
                    id: "3-1",
                    icon: <ArrowDownCircle className="w-4 h-4" />,
                    label: "Nhập/xuất kho",
                    path: "/warehouse/import-export",
                },
                {
                    id: "3-2",
                    icon: <BarChart3 className="w-4 h-4" />,
                    label: "Thống kê kho",
                    path: "/warehouse/statistic",
                },
            ],
        },
        {
            id: "4",
            icon: <Layers className="w-5 h-5" />,
            label: "Quản lý nguyên vật liệu",
            hasSubmenu: true,
            submenu: [
                {
                    id: "4-1",
                    icon: <BarChart3 className="w-4 h-4" />,
                    label: "Dashboard",
                    path: "/ingredient/dashboard",
                }
            ],
        },
        {
            id: "5",
            icon: <Users className="w-5 h-5" />,
            label: "Quản lý tài khoản",
            hasSubmenu: true,
            submenu: [
                {
                    id: "5-1",
                    icon: <BarChart3 className="w-4 h-4" />,
                    label: "Dashboard",
                    path: "/account/dashboard",
                },
                {
                    id: "5-2",
                    icon: <UserPlus className="w-4 h-4" />,
                    label: "Thêm tài khoản",
                    path: "/account/create",
                },
            ],
        },
    ];

    const toggleSubmenu = (itemId: string | null) => {
        if (collapsed) return;
        setOpenSubmenu(openSubmenu === itemId ? null : itemId);
    };

    return (
        <aside
            className={cn(
                'bg-gradient-to-b from-slate-50 to-red-50 text-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-lg border-r border-slate-200',
                collapsed ? 'w-20' : 'w-52'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-300 bg-white/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-red-600">
                    {collapsed ? <img src={'/image.png'} alt='Ảnh bún bò thumbnail' loading='lazy' /> : 'Bún Bò Ha'}
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => {
                    const isActiveParent =
                        item.path && path_name === (item.path);

                    const isActiveSub =
                        item.hasSubmenu &&
                        item.submenu?.some((sub) => path_name === (sub.path));

                    const isExpanded = openSubmenu === item.id || isActiveSub;

                    return (
                        <div key={item.id}>
                            {/* Main Menu Item */}
                            <div
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 hover:bg-red-100 cursor-pointer transition-colors rounded-lg mx-2',
                                    collapsed && 'justify-center',
                                    (isActiveParent || isActiveSub) && 'bg-red-500 text-white shadow-md'
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
                                                {isExpanded ? (
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
                            {item.hasSubmenu && !collapsed && isExpanded && (
                                <div className="bg-white/30 backdrop-blur-sm mx-2 rounded-lg mt-1">
                                    {item.submenu.map((subItem) => {
                                        const isActiveSubItem = path_name === (subItem.path);
                                        return (
                                            <div
                                                key={subItem.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 pl-12 cursor-pointer transition-colors rounded-lg mx-2 my-1",
                                                    isActiveSubItem
                                                        ? "bg-red-400 text-white shadow-sm"
                                                        : "hover:bg-red-50 text-slate-700"
                                                )}
                                                onClick={() => handleNavigate(subItem.path, item.id)}
                                            >
                                                <span>{subItem.icon}</span>
                                                <span className="text-sm">{subItem.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default AdminSideBar