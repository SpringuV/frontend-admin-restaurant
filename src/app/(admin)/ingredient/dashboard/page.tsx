import IngredientDashboard from "@/components/admin/ingredient/ingredient-dashboard"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Ngyên vật liệu - Dashboard',
    description: 'Trang quản lý nguyên vật liệu',
};


const IngredientDashboardPage = ()=>{
    return (
        <>
            <IngredientDashboard />
        </>
    )
}

export default IngredientDashboardPage