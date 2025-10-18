import AdminLayoutClient from "@/layout/admin.layout.client";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = async ({ children }) => {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
};

export default AdminLayout