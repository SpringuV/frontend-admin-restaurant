'use client'
import React, { useState } from 'react';
import AdminHeader from './admin.layout.header';
import AdminSideBar from './admin.layout.sidebar';
import AdminContent from './admin.layout.content';

const AdminLayoutClient = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);

    

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSideBar onCollapse={setCollapsed} collapsed={collapsed}/>

            {/* Main Content */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <AdminHeader onCollapse={setCollapsed} collapsed={collapsed} />
                {/* Content */}
                <AdminContent>
                    {children}
                </AdminContent>
            </div>
        </div>
    );
};

export default AdminLayoutClient;