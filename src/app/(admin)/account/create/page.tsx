
import AccountCreate from "@/components/admin/account/account-create"
import { Metadata } from "next";
export const metadata: Metadata = {
    title: 'Nhập kho',
    description: 'Nhập kho',
};


const AccountCreatePage = () => {
    return (
        <>
            <AccountCreate />
        </>
    )
}

export default AccountCreatePage