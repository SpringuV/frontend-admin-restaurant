/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { Users } from 'lucide-react';
import ModalBooking from '@/components/admin/booking/modal-booking';
import ModalOrderDetail from '@/components/admin/booking/modal-order-detail';
import { AlertProps, BookingSessionInfo, DataPropsToModalDetail, TableOrderDetailResponse, TableType } from '../../../lib/types';
import { useLoadGuestTable, useGetOrderDetail } from '@/hooks/booking-orders';
import { Spinner } from '@/components/ui/spinner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import Alert from '@/components/alert/alert';
import ModalOrderSelection from '@/components/admin/booking/modal-order-selection';

const BookingPage = () => {
    const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOrderSelectionOpen, setIsOrderSelectionOpen] = useState(false);
    const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [alert, setAlert] = useState<AlertProps | null>(null);
    const [dataProps, setDataProps] = useState<DataPropsToModalDetail | null>(null);

    const { tables, isLoading, error, reload } = useLoadGuestTable();
    const { getOrderDetail, orderDetail, isLoading: loadingOrders } = useGetOrderDetail();

    const handleTableClick = async (table: TableType) => {
        setSelectedTable(table);
        console.log("table: ", table)
        // Nếu bàn trống → mở modal đặt bàn luôn
        if (table.available) {
            setIsModalOpen(true);
            return;
        }

        try {
            // Lấy danh sách bàn đã đặt trong sessionStorage
            const sessionOrders = JSON.parse(sessionStorage.getItem("booked_tables") || "[]");
            console.log("sessionOrders", sessionOrders)
            // Tìm order tương ứng với bàn hiện tại
            const matchedOrders: BookingSessionInfo[] = sessionOrders.filter(
                (o: any) => o.id_table === table.id_table
            );
            // Kiểm tra có order nào không
            if (matchedOrders.length === 0) {
                setAlert({
                    title: 'Thông báo',
                    type: 'warning',
                    message: 'Bàn này chưa có order nào trong session.',
                    duration: 4000,
                });
                return;
            }

            const orderResponse: TableOrderDetailResponse = await getOrderDetail(matchedOrders[0].id_order); // lấy id

            if (orderResponse.code === 100) {
                setDataProps(orderResponse.result)
                setSelectedOrderId(matchedOrders[0].id_order);
                setIsOrderDetailOpen(true);
            } else {
                setAlert({
                    title: 'Thông báo',
                    type: 'warning',
                    message: orderResponse.message || 'Không thể tải thông tin order.',
                    duration: 4000,
                });
            }
        } catch (err) {
            console.error('Get table orders failed:', err);
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Không thể tải danh sách order. Vui lòng thử lại!',
                duration: 4000,
            });
        }
    };

    const handleOrderSelect = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsOrderSelectionOpen(false);
        setIsOrderDetailOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    const closeOrderSelection = () => {
        setIsOrderSelectionOpen(false);
        setSelectedTable(null);
    };

    const closeOrderDetail = () => {
        setIsOrderDetailOpen(false);
        setSelectedOrderId(null);
        setSelectedTable(null);
    };

    const getStatusColor = (available: boolean) => {
        return available
            ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
            : 'bg-red-500 hover:bg-red-600 cursor-pointer';
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

            {/* Loading Overlay khi đang query orders */}
            {loadingOrders && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
                        <Spinner className="w-12 h-12" />
                        <p className="text-gray-700 font-medium">Đang tải thông tin bàn...</p>
                    </div>
                </div>
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Grid */}
                {isLoading ? (
                    <div className='flex justify-center h-[350px] w-full items-center gap-2'>
                        <Spinner className="w-12 h-12" />
                        <span>Đang tải bàn...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    </div>
                )}

                {/* Modal Đặt bàn (cho bàn trống) */}
                <ModalBooking
                    onAlert={setAlert}
                    onReloadListTable={reload}
                    selectedTable={selectedTable}
                    onClose={closeModal}
                    isModalOpen={isModalOpen}
                />

                {/* Modal Chọn Order */}
                <ModalOrderSelection
                    isOpen={isOrderSelectionOpen}
                    onClose={closeOrderSelection}
                    order={orderDetail ? orderDetail : null}
                    tableId={selectedTable?.id_table || 0}
                    onSelectOrder={handleOrderSelect}
                />

                {/* Modal Chi tiết Order */}
                <ModalOrderDetail
                    data={dataProps}
                    isOpen={isOrderDetailOpen}
                    onClose={closeOrderDetail}
                    orderId={selectedOrderId || 0}
                    tableId={selectedTable?.id_table || 0}
                    onReloadTables={reload}
                    onAlert={setAlert}
                />
            </div>
        </ProtectedRoute>
    );
};

export default BookingPage;