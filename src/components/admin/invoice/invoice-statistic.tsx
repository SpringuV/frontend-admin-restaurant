/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { FileDown, TrendingUp, DollarSign, Users, ShoppingCart, Calendar, Award, CreditCard } from 'lucide-react';
import { useLoadRevenueStatistics } from '@/hooks/invoice';
import { Spinner } from '@/components/ui/spinner';
import { formatInstantToDateOnly } from '@/utils/date-utils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = {
    primary: '#f43f5e', // rose-500
    secondary: '#fb7185', // rose-400
    tertiary: '#fda4af', // rose-300
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
};

const CHART_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#10b981', '#3b82f6', '#f59e0b'];

export default function InvoiceStatistic() {
    const { statistics, isLoadingStatistics, statisticsError, reloadStatistics } = useLoadRevenueStatistics();
    const [isExporting, setIsExporting] = useState(false);

    // Hàm xuất Excel
    const handleExportExcel = () => {
        if (!statistics) return;
        
        setIsExporting(true);
        try {
            // Tạo workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: Tổng quan
            const overviewData = [
                ['CHỈ SỐ', 'GIÁ TRỊ'],
                ['Tổng doanh thu', statistics.totalRevenue.toLocaleString() + 'đ'],
                ['Tổng giảm giá', statistics.totalDiscount.toLocaleString() + 'đ'],
                ['Doanh thu ròng', statistics.netRevenue.toLocaleString() + 'đ'],
                ['Tổng hóa đơn', statistics.totalInvoices],
                ['Tổng đơn hàng', statistics.totalOrders],
                [''],
                ['THỐNG KÊ THEO TRẠNG THÁI THANH TOÁN'],
                ['Đã thanh toán - Số lượng', statistics.paymentStatusStats.paidCount],
                ['Đã thanh toán - Tổng tiền', statistics.paymentStatusStats.paidAmount.toLocaleString() + 'đ'],
                ['Chờ thanh toán - Số lượng', statistics.paymentStatusStats.pendingCount],
                ['Chờ thanh toán - Tổng tiền', statistics.paymentStatusStats.pendingAmount.toLocaleString() + 'đ'],
                ['Đã hoàn tiền - Số lượng', statistics.paymentStatusStats.refundedCount],
                ['Đã hoàn tiền - Tổng tiền', statistics.paymentStatusStats.refundedAmount.toLocaleString() + 'đ'],
                [''],
                ['THỐNG KÊ THEO PHƯƠNG THỨC THANH TOÁN'],
                ['Tiền mặt - Số lượng', statistics.paymentMethodStats.cashCount],
                ['Tiền mặt - Tổng tiền', statistics.paymentMethodStats.cashAmount.toLocaleString() + 'đ'],
                ['Chuyển khoản - Số lượng', statistics.paymentMethodStats.bankingCount],
                ['Chuyển khoản - Tổng tiền', statistics.paymentMethodStats.bankingAmount.toLocaleString() + 'đ'],
                [''],
                ['THỐNG KÊ THỜI GIAN'],
                ['Ngày bắt đầu', formatInstantToDateOnly(statistics.timeRangeStats.startDate)],
                ['Ngày kết thúc', formatInstantToDateOnly(statistics.timeRangeStats.endDate)],
                ['Tổng số ngày', statistics.timeRangeStats.totalDays],
                ['Doanh thu TB/ngày', statistics.timeRangeStats.averageRevenuePerDay.toLocaleString() + 'đ'],
                ['Giá trị đơn hàng TB', statistics.timeRangeStats.averageOrderValue.toLocaleString() + 'đ'],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

            // Sheet 2: Top khách hàng
            const customerHeaders = [['STT', 'Tên khách hàng', 'SĐT', 'Tổng đơn', 'Tổng chi tiêu', 'Giá trị TB/đơn']];
            const customerData = statistics.topCustomers.map((customer, index) => [
                index + 1,
                customer.customerName,
                customer.phoneNumber,
                customer.totalOrders,
                customer.totalSpent.toLocaleString() + 'đ',
                customer.averageOrderValue.toLocaleString() + 'đ'
            ]);
            const ws2 = XLSX.utils.aoa_to_sheet([...customerHeaders, ...customerData]);
            XLSX.utils.book_append_sheet(wb, ws2, 'Top khách hàng');

            // Sheet 3: Top nhân viên
            const employeeHeaders = [['STT', 'Tên nhân viên', 'Username', 'Tổng HĐ', 'Tổng doanh thu', 'Giá trị TB/HĐ']];
            const employeeData = statistics.topEmployees.map((emp, index) => [
                index + 1,
                emp.employeeName,
                emp.username,
                emp.totalInvoices,
                emp.totalRevenue.toLocaleString() + 'đ',
                emp.averageInvoiceValue.toLocaleString() + 'đ'
            ]);
            const ws3 = XLSX.utils.aoa_to_sheet([...employeeHeaders, ...employeeData]);
            XLSX.utils.book_append_sheet(wb, ws3, 'Top nhân viên');

            // Sheet 4: Doanh thu theo ngày
            const dailyHeaders = [['Ngày', 'Số HĐ', 'Doanh thu', 'Giảm giá', 'Doanh thu ròng']];
            const dailyData = statistics.dailyRevenues.map((daily) => [
                formatInstantToDateOnly(daily.date),
                daily.totalInvoices,
                daily.totalRevenue.toLocaleString() + 'đ',
                daily.totalDiscount.toLocaleString() + 'đ',
                daily.netRevenue.toLocaleString() + 'đ'
            ]);
            const ws4 = XLSX.utils.aoa_to_sheet([...dailyHeaders, ...dailyData]);
            XLSX.utils.book_append_sheet(wb, ws4, 'Doanh thu theo ngày');

            // Xuất file
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, `Thong-ke-doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Có lỗi khi xuất file Excel!');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoadingStatistics) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
            </div>
        );
    }

    if (statisticsError) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-red-600 font-medium">Không thể tải dữ liệu thống kê</p>
                <button 
                    onClick={() => reloadStatistics()}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Không có dữ liệu thống kê</p>
            </div>
        );
    }

    // Chuẩn bị data cho biểu đồ
    const paymentStatusChartData = [
        { name: 'Đã thanh toán', value: statistics.paymentStatusStats.paidAmount, count: statistics.paymentStatusStats.paidCount },
        { name: 'Chờ thanh toán', value: statistics.paymentStatusStats.pendingAmount, count: statistics.paymentStatusStats.pendingCount },
        { name: 'Đã hoàn tiền', value: statistics.paymentStatusStats.refundedAmount, count: statistics.paymentStatusStats.refundedCount },
    ];

    const paymentMethodChartData = [
        { name: 'Tiền mặt', value: statistics.paymentMethodStats.cashAmount, count: statistics.paymentMethodStats.cashCount },
        { name: 'Chuyển khoản', value: statistics.paymentMethodStats.bankingAmount, count: statistics.paymentMethodStats.bankingCount },
    ];

    const dailyRevenueChartData = statistics.dailyRevenues
        .slice(0, 14) // Lấy 14 ngày gần nhất
        .reverse()
        .map(daily => ({
            date: formatInstantToDateOnly(daily.date),
            revenue: daily.totalRevenue,
            discount: daily.totalDiscount,
            netRevenue: daily.netRevenue,
        }));

    const topCustomersChartData = statistics.topCustomers.slice(0, 5).map(customer => ({
        name: customer.customerName,
        value: customer.totalSpent,
        orders: customer.totalOrders,
    }));

    const topEmployeesChartData = statistics.topEmployees.slice(0, 5).map(emp => ({
        name: emp.employeeName,
        value: emp.totalRevenue,
        invoices: emp.totalInvoices,
    }));

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                        Thống kê doanh thu
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Từ {formatInstantToDateOnly(statistics.timeRangeStats.startDate)} đến {formatInstantToDateOnly(statistics.timeRangeStats.endDate)}
                    </p>
                </div>
                <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-semibold">
                        {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                    </span>
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm opacity-90">Doanh thu ròng</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                                {(statistics.netRevenue / 1000000).toFixed(1)}M
                            </h3>
                            <p className="text-xs mt-1 opacity-75">{statistics.netRevenue.toLocaleString()}đ</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm opacity-90">Tổng doanh thu</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                                {(statistics.totalRevenue / 1000000).toFixed(1)}M
                            </h3>
                            <p className="text-xs mt-1 opacity-75">{statistics.totalRevenue.toLocaleString()}đ</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm opacity-90">Tổng hóa đơn</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                                {statistics.totalInvoices}
                            </h3>
                            <p className="text-xs mt-1 opacity-75">
                                TB: {statistics.timeRangeStats.averageOrderValue.toLocaleString()}đ
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm opacity-90">DT TB/ngày</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                                {(statistics.timeRangeStats.averageRevenuePerDay / 1000000).toFixed(2)}M
                            </h3>
                            <p className="text-xs mt-1 opacity-75">
                                Trong {statistics.timeRangeStats.totalDays} ngày
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1: Payment Status & Method */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Biểu đồ trạng thái thanh toán */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-rose-600" />
                        Thống kê theo trạng thái thanh toán
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentStatusChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentStatusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs sm:text-sm">
                        <div className="text-center p-2 bg-rose-50 rounded">
                            <p className="text-gray-600">Đã TT</p>
                            <p className="font-bold text-rose-600">{statistics.paymentStatusStats.paidCount}</p>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded">
                            <p className="text-gray-600">Chờ TT</p>
                            <p className="font-bold text-amber-600">{statistics.paymentStatusStats.pendingCount}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-gray-600">Hoàn tiền</p>
                            <p className="font-bold text-gray-600">{statistics.paymentStatusStats.refundedCount}</p>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ phương thức thanh toán */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-rose-600" />
                        Thống kê theo phương thức thanh toán
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentMethodChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                            />
                            <Legend />
                            <Bar dataKey="value" fill={COLORS.primary} name="Doanh thu" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs sm:text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-gray-600">Tiền mặt</p>
                            <p className="font-bold text-green-600">{statistics.paymentMethodStats.cashCount} HĐ</p>
                            <p className="text-xs text-gray-500">{statistics.paymentMethodStats.cashAmount.toLocaleString()}đ</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="text-gray-600">Chuyển khoản</p>
                            <p className="font-bold text-blue-600">{statistics.paymentMethodStats.bankingCount} HĐ</p>
                            <p className="text-xs text-gray-500">{statistics.paymentMethodStats.bankingAmount.toLocaleString()}đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ doanh thu theo ngày */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                    Doanh thu 14 ngày gần nhất
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dailyRevenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip 
                            formatter={(value: number) => `${value.toLocaleString()}đ`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} name="Doanh thu" />
                        <Line type="monotone" dataKey="discount" stroke={COLORS.warning} strokeWidth={2} name="Giảm giá" />
                        <Line type="monotone" dataKey="netRevenue" stroke={COLORS.success} strokeWidth={2} name="Doanh thu ròng" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts Row 2: Top Customers & Employees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 khách hàng */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-600" />
                        Top 5 khách hàng
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCustomersChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                            />
                            <Bar dataKey="value" fill={COLORS.secondary} name="Tổng chi tiêu" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {statistics.topCustomers.slice(0, 5).map((customer, index) => (
                            <div key={customer.customerId} className="flex items-center justify-between text-xs sm:text-sm p-2 bg-rose-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-rose-600">#{index + 1}</span>
                                    <div>
                                        <p className="font-medium">{customer.customerName}</p>
                                        <p className="text-gray-500 text-xs">{customer.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-rose-600">{customer.totalOrders} đơn</p>
                                    <p className="text-xs text-gray-500">{customer.totalSpent.toLocaleString()}đ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top 5 nhân viên */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-rose-600" />
                        Top 5 nhân viên
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topEmployeesChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                            />
                            <Bar dataKey="value" fill={COLORS.info} name="Tổng doanh thu" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {statistics.topEmployees.slice(0, 5).map((emp, index) => (
                            <div key={emp.employeeId} className="flex items-center justify-between text-xs sm:text-sm p-2 bg-blue-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-600">#{index + 1}</span>
                                    <div>
                                        <p className="font-medium">{emp.employeeName}</p>
                                        <p className="text-gray-500 text-xs">@{emp.username}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">{emp.totalInvoices} HĐ</p>
                                    <p className="text-xs text-gray-500">{emp.totalRevenue.toLocaleString()}đ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
