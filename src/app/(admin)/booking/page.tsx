/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { Users } from 'lucide-react';
import ModalBooking from '@/components/admin/booking/modal-booking';
import { AlertProps, TableType } from '../../../lib/types';
import { useLoadGuestTable } from '@/hooks/booking-orders';
import { Spinner } from '@/components/ui/spinner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import Alert from '@/components/alert/alert';



const BookingPage = () => {
    const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState<AlertProps | null>(null)
    const { tables, isLoading, error, reload } = useLoadGuestTable()

    const handleTableClick = (table: TableType) => {
        if (table.available) {
            setSelectedTable(table);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    const getStatusColor = (available: boolean) => {
        return available ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : 'bg-red-500 cursor-not-allowed';
    };

    const getStatusText = (available: boolean) => {
        return available ? 'Trống' : 'Đang sử dụng';
    };

    return (
        <ProtectedRoute>
            {/* Hiển thị Alert */}
            {alert && (
                <Alert
                    title={alert.title}
                    type={alert.type}
                    message={alert.message}
                    icon={alert.icon}
                    duration={alert.duration}
                />
            )}
            <div className="min-h-screen h-full w-full bg-gray-50 md:p-4">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className='flex justify-between'>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt bàn</h1>
                        <div className='flex justify-center items-center gap-4'>
                            <p className="text-gray-600">Chọn bàn để thực hiện đặt chỗ</p>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Trống</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Đang sử dụng</span>
                                </div>
                                {/* <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm text-gray-700">Đã đặt</span>
                    </div> */}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Tables Grid */}
                {isLoading ? (<div className='flex justify-center h-[350px] w-full items-center'>
                    <Spinner className="w-12 h-12" />
                    <span>Đang tải bàn...</span>
                </div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map((table: TableType) => (
                        <div
                            key={table.id_table}
                            onClick={() => handleTableClick(table)}
                            className={`${getStatusColor(table.available)} rounded-lg p-6 text-white transition-all duration-200 transform hover:scale-105 shadow-lg`}
                        >
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">{table.id_table}</div>
                                <div className="flex items-center justify-center gap-1 text-sm mb-1">
                                    <Users className="w-4 h-4" />
                                    <span>{table.capacity} người</span>
                                </div>
                                <div className="text-xs opacity-90">{getStatusText(table.available)}</div>
                            </div>
                        </div>
                    ))}
                </div>)}

                <ModalBooking onAlert={setAlert} onReloadListTable={reload} selectedTable={selectedTable} onClose={closeModal} isModalOpen={isModalOpen} />
            </div>
        </ProtectedRoute>
    );
};



export default BookingPage;