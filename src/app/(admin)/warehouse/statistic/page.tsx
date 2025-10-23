import InventoryHistory from "@/components/admin/warehouse/inventory-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Thống kê kho',
    description: 'Thống kê kho',
};


const StatisticPage = ()=> {
    return (
        <>
            <InventoryHistory />
        </>
    )
}
export default StatisticPage