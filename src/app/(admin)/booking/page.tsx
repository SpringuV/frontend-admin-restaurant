/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { Users } from 'lucide-react';
import ModalBooking from '@/components/admin/booking/modal-booking';
import { TableType } from '../../../lib/types';



const BookingPage = () => {
    const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fake data cho các bàn
    const tables = [
        { id: 1, number: 1, capacity: 2, status: 'available' },
        { id: 2, number: 2, capacity: 4, status: 'available' },
        { id: 3, number: 3, capacity: 2, status: 'occupied' },
        { id: 4, number: 4, capacity: 6, status: 'available' },
        { id: 5, number: 5, capacity: 4, status: 'occupied' },
        { id: 6, number: 6, capacity: 2, status: 'available' },
        { id: 7, number: 7, capacity: 8, status: 'available' },
        { id: 8, number: 8, capacity: 4, status: 'occupied' },
        { id: 9, number: 9, capacity: 2, status: 'available' },
        { id: 10, number: 10, capacity: 6, status: 'available' },
        { id: 11, number: 11, capacity: 4, status: 'available' },
        { id: 12, number: 12, capacity: 2, status: 'occupied' },
    ];

    const handleTableClick = (table: any) => {
        if (table.status === 'available') {
            setSelectedTable(table);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-500 hover:bg-green-600';
            case 'occupied':
                return 'bg-red-500 cursor-not-allowed';
            // case 'reserved':
            //     return 'bg-yellow-500 cursor-not-allowed';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'Trống';
            case 'occupied':
                return 'Đang sử dụng';
            // case 'reserved':
            //     return 'Đã đặt';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 md:p-4">
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
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`
                ${getStatusColor(table.status)}
                rounded-lg p-6 text-white transition-all duration-200
                transform hover:scale-105 shadow-lg
                ${table.status === 'available' ? 'cursor-pointer' : 'opacity-70'}
              `}
                        >
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">
                                    {table.number}
                                </div>
                                <div className="flex items-center justify-center gap-1 text-sm mb-1">
                                    <Users className="w-4 h-4" />
                                    <span>{table.capacity} người</span>
                                </div>
                                <div className="text-xs opacity-90">
                                    {getStatusText(table.status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ModalBooking selectedTable={selectedTable} onClose={closeModal} isModalOpen={isModalOpen} onOpen={setIsModalOpen} />
        </div>
    );
};

export default BookingPage;