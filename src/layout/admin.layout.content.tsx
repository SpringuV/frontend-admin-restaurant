const AdminContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <main className="flex-1 overflow-auto p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-400 rounded-lg shadow-sm p-6 min-h-full">
                    {children}
                </div>
            </main>
        </>
    )
}

export default AdminContent