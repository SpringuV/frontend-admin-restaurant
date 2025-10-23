import ImportExport from "@/components/admin/warehouse/import-export";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Nhập/Xuất kho',
    description: 'Nhập/Xuất kho',
};

const ImportExportPage = ()=> {
    return (
        <>
            <ImportExport />
        </>
    )
}
export default ImportExportPage