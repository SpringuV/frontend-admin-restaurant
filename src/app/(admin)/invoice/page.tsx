import InvoiceDashboard from "@/components/admin/invoice/invoice-dashboard";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Hóa đơn - Dashboard',
    description: 'Trang quản lý hóa đơn',
};

const InvoicePage = () => {
    return (
        <>
            <InvoiceDashboard />
        </>
    )
}
export default InvoicePage