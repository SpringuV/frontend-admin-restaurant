const AdminContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <div className="bg-gradient-to-br dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-3 sm:p-4 lg:p-6 min-h-full">
                {children}
            </div>
        </main>
    )
}

export default AdminContent