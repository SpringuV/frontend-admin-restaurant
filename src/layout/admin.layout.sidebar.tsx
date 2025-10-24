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
    Warehouse,
    X
} from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';

interface AdminSideBarProps {
    collapsed: boolean;
    onCollapse: (value: boolean) => void;
    isMobile?: boolean;
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (value: boolean) => void;
}

const AdminSideBar = ({ collapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }: AdminSideBarProps) => {
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

    const handleMenuClick = (path?: string, parentId?: string) => {
        handleNavigate(path, parentId);
        if (isMobile && setMobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <aside
            className={cn(
                'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 text-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl border-r border-slate-200/50 backdrop-blur-sm',
                collapsed ? 'w-20' : 'w-64',
                isMobile && 'fixed inset-y-0 left-0 z-50',
                isMobile && !mobileMenuOpen && '-translate-x-full'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm">
                <div className={cn(
                    "font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent transition-all",
                    collapsed ? "text-xl" : "text-2xl"
                )}>
                    {collapsed ? (
                        <img src={'/image.png'} alt='Logo' className="w-10 h-10 object-cover rounded-lg" loading='lazy' />
                    ) : (
                        'Bún Bò Ha'
                    )}
                </div>
                {isMobile && !collapsed && (
                    <button 
                        onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-rose-600" />
                    </button>
                )}
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
                                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-xl mx-2 group',
                                    collapsed && 'justify-center',
                                    (isActiveParent || isActiveSub) 
                                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg scale-105' 
                                        : 'hover:bg-gradient-to-r hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 hover:scale-105 hover:shadow-md'
                                )}
                                onClick={() => {
                                    if (item.hasSubmenu) {
                                        toggleSubmenu(item.id);
                                    } else {
                                        handleMenuClick(item.path);
                                    }
                                }}
                            >
                                <span className={cn(
                                    "transition-colors",
                                    (isActiveParent || isActiveSub) && "text-white"
                                )}>{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="text-sm font-semibold flex-1">{item.label}</span>
                                        {item.hasSubmenu && (
                                            <span className="transition-transform duration-300">
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
                                <div className="bg-white/60 backdrop-blur-md mx-2 rounded-xl mt-1 border border-slate-200/50 shadow-inner overflow-hidden">
                                    {item.submenu.map((subItem) => {
                                        const isActiveSubItem = path_name === (subItem.path);
                                        return (
                                            <div
                                                key={subItem.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 pl-12 cursor-pointer transition-all mx-2 my-1 rounded-lg",
                                                    isActiveSubItem
                                                        ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md scale-105"
                                                        : "hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 text-slate-700 hover:scale-105"
                                                )}
                                                onClick={() => handleMenuClick(subItem.path, item.id)}
                                            >
                                                <span>{subItem.icon}</span>
                                                <span className="text-sm font-medium">{subItem.label}</span>
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