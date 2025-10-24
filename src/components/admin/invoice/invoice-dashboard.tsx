'use client'
import { useState } from 'react';
import { Search, Filter, DollarSign, Calendar, User, Phone, ShoppingBag, Clock, FileText, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { useLoadInvoiceDashboard, Invoice } from '@/hooks/invoice';
import { Spinner } from '@/components/ui/spinner';
import { formatInstantToDateOnly } from '@/utils/date-utils';

const paymentStatusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    PAID: 'bg-green-100 text-green-800 border-green-300',
    REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300'
};

const paymentStatusText = {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền'
};

const orderStatusColor = {
    PENDING: 'bg-blue-100 text-blue-800',
    READY: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
};

const orderStatusText = {
    PENDING: 'Chờ xử lý',
    READY: 'Sẵn sàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
};

// Utility function to shorten UUID
const shortenInvoiceId = (id: string): string => {
    // Extract first 8 characters of UUID
    return id.split('-')[0].toUpperCase();
};

export default function InvoiceDashboard() {
    // Load data from API
    const { invoices: apiInvoices, isLoadingInvoices, invoicesError, reloadInvoices } = useLoadInvoiceDashboard();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterMethod, setFilterMethod] = useState<string>('ALL');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Keep timestamps as numbers to match the Invoice type
    const invoices: Invoice[] = apiInvoices;

    const filteredInvoices = invoices.filter(invoice => {
        const matchSearch =
            invoice.id_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customer.name_cus.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customer.phone_number_cus.includes(searchTerm);

        const matchStatus = filterStatus === 'ALL' || invoice.payment_status === filterStatus;
        const matchMethod = filterMethod === 'ALL' || invoice.payment_method === filterMethod;

        return matchSearch && matchStatus && matchMethod;
    });

    const totalRevenue = filteredInvoices
        .filter(inv => inv.payment_status === 'PAID')
        .reduce((sum, inv) => sum + (inv.orders.total_amount - inv.discount), 0);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleRow = (invoiceId: string) => {
        setExpandedRow(expandedRow === invoiceId ? null : invoiceId);
    };

    // Loading state
    if (isLoadingInvoices) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="w-12 h-12 text-blue-600" />
                    <p className="text-gray-600 font-medium">Đang tải dữ liệu hóa đơn...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (invoicesError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-gray-600 mb-4">
                            {invoicesError.message || 'Không thể tải danh sách hóa đơn'}
                        </p>
                        <button
                            onClick={() => reloadInvoices()}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                Quản lý Hóa đơn
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Theo dõi và quản lý tất cả hóa đơn</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-gray-600">Tổng doanh thu</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-600">
                                {totalRevenue.toLocaleString()}đ
                            </p>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-90">Tổng hóa đơn</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{filteredInvoices.length}</p>
                                </div>
                                <FileText className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-90">Đã thanh toán</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">
                                        {filteredInvoices.filter(inv => inv.payment_status === 'PAID').length}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 sm:p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-90">Chờ thanh toán</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">
                                        {filteredInvoices.filter(inv => inv.payment_status === 'PENDING').length}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-90">Tiền mặt</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">
                                        {filteredInvoices.filter(inv => inv.payment_method === 'CASH').length}
                                    </p>
                                </div>
                                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã HĐ, tên KH, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Bộ lọc</span>
                            <span className="sm:hidden">Lọc</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái thanh toán
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="PENDING">Chờ thanh toán</option>
                                    <option value="REFUNDED">Đã hoàn tiền</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Phương thức thanh toán
                                </label>
                                <select
                                    value={filterMethod}
                                    onChange={(e) => setFilterMethod(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="BANKING">Chuyển khoản</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gradient-to-r from-rose-600 to-red-600 text-white">
                                <tr>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">Mã HĐ</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">Khách hàng</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">Nhân viên</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">Tổng tiền</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Giảm giá</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">Thanh toán</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden xl:table-cell">PT Thanh toán</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">Thời gian</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredInvoices.map((invoice, index) => (
                                    <>
                                        <tr
                                            key={invoice.id_invoice}
                                            className={`hover:bg-rose-50 transition ${index % 2 === 0 ? 'bg-rose-50/30' : 'bg-white'}`}
                                        >
                                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                <div className="font-semibold text-rose-600 text-xs sm:text-sm">
                                                    {shortenInvoiceId(invoice.id_invoice)}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-gray-500">Order #{invoice.orders.id_order}</div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" />
                                                    <div>
                                                        <div className="font-medium text-gray-800 text-xs sm:text-sm">{invoice.customer.name_cus}</div>
                                                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                                                            <Phone className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            {invoice.customer.phone_number_cus}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                                                <div className="font-medium text-gray-700 text-xs sm:text-sm">{invoice.user.full_name}</div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                <div className="font-bold text-green-600 text-xs sm:text-sm">
                                                    {invoice.orders.total_amount.toLocaleString()}đ
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                                                <div className="font-semibold text-orange-600 text-xs sm:text-sm">
                                                    {invoice.discount > 0 ? `-${invoice.discount.toLocaleString()}đ` : '0đ'}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                <div className="flex items-center justify-center">
                                                    {invoice.payment_status === 'PAID' ? (
                                                        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-100">
                                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" strokeWidth={2.5} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100">
                                                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" strokeWidth={2.5} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden xl:table-cell">
                                                <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold ${invoice.payment_method === 'CASH'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    <DollarSign className="w-3 h-3" />
                                                    {invoice.payment_method === 'CASH' ? 'Tiền mặt' : 'CK'}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {formatInstantToDateOnly(invoice.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                                <button
                                                    onClick={() => toggleRow(invoice.id_invoice)}
                                                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs sm:text-sm font-medium"
                                                >
                                                    {expandedRow === invoice.id_invoice ? (
                                                        <>
                                                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="hidden sm:inline">Ẩn</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="hidden sm:inline">Xem</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedRow === invoice.id_invoice && (
                                            <tr>
                                                <td colSpan={9} className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-purple-50">
                                                    <div className="space-y-3 sm:space-y-4">
                                                        {/* Order Status & Note */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                            <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                                                                <p className="text-xs sm:text-sm text-gray-600 mb-2">Trạng thái đơn hàng</p>
                                                                <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${orderStatusColor[invoice.orders.order_status]}`}>
                                                                    {orderStatusText[invoice.orders.order_status]}
                                                                </span>
                                                            </div>
                                                            {(invoice.orders.note_order || invoice.note) && (
                                                                <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-purple-200">
                                                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Ghi chú</p>
                                                                    <p className="text-xs sm:text-sm italic text-gray-700">
                                                                        {invoice.orders.note_order || invoice.note}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Order Items */}
                                                        <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-green-200">
                                                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                                                Danh sách món ({invoice.orders.order_item_list.length} món)
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {invoice.orders.order_item_list.map((item) => (
                                                                    <div
                                                                        key={item.id_order_item}
                                                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-2"
                                                                    >
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-800 text-xs sm:text-sm">{item.name_food}</p>
                                                                            {item.note && (
                                                                                <p className="text-[10px] sm:text-xs text-gray-500 italic mt-1">📝 {item.note}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center justify-between sm:gap-3 md:gap-4">
                                                                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                                                                                x{item.quantity}
                                                                            </span>
                                                                            <span className="text-xs sm:text-sm font-bold text-green-600 min-w-[70px] sm:min-w-[100px] text-right">
                                                                                {item.price.toLocaleString()}đ
                                                                            </span>
                                                                            <span className="text-xs sm:text-sm font-bold text-orange-600 min-w-[80px] sm:min-w-[120px] text-right">
                                                                                = {(item.price * item.quantity).toLocaleString()}đ
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Summary */}
                                                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-dashed border-gray-300 space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Tạm tính:</span>
                                                                    <span className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">
                                                                        {invoice.orders.total_amount.toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                                {invoice.discount > 0 && (
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-semibold text-orange-600 text-xs sm:text-sm">Giảm giá:</span>
                                                                        <span className="font-bold text-orange-600 text-sm sm:text-base md:text-lg">
                                                                            -{invoice.discount.toLocaleString()}đ
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                                                                    <span className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">Thành tiền:</span>
                                                                    <span className="font-bold text-green-600 text-lg sm:text-xl md:text-2xl">
                                                                        {(invoice.orders.total_amount - invoice.discount).toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>

                        {filteredInvoices.length === 0 && (
                            <div className="text-center py-16">
                                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Không tìm thấy hóa đơn nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}