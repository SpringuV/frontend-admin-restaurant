'use client'
import React, { useState, useEffect } from 'react';
import AdminHeader from './admin.layout.header';
import AdminSideBar from './admin.layout.sidebar';
import AdminContent from './admin.layout.content';
import AdminFooter from './admin.layout.footer';

const AdminLayoutClient = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
                setMobileMenuOpen(false);
            } else {
                setCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggleSidebar = () => {
        if (isMobile) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            setCollapsed(!collapsed);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {isMobile && mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSideBar 
                onCollapse={setCollapsed} 
                collapsed={collapsed}
                isMobile={isMobile}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <AdminHeader 
                    onCollapse={handleToggleSidebar} 
                    collapsed={collapsed}
                    isMobile={isMobile}
                />
                {/* Content */}
                <AdminContent>
                    {children}
                </AdminContent>
                <AdminFooter/>
            </div>
        </div>
    );
};

export default AdminLayoutClient;