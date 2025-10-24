import InvoiceStatistic from "@/components/admin/invoice/invoice-statistic";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Thống kê hóa đơn',
    description: 'Trang thống kê hóa đơn',
};


const StatisticInvoicePage = () => {

    return (
        <>
            <InvoiceStatistic />
        </>
    )
}
export default StatisticInvoicePage