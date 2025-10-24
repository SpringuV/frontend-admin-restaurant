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

const CHART_COLORS = [
    '#f43f5e', // rose
    '#a855f7', // purple
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#6366f1', // indigo
    '#f97316', // orange
];

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
                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
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

                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
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

                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
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

                <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
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
                        <div className="text-center p-2 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                            <p className="text-gray-600">Đã TT</p>
                            <p className="font-bold text-rose-600">{statistics.paymentStatusStats.paidCount}</p>
                        </div>
                        <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                            <p className="text-gray-600">Chờ TT</p>
                            <p className="font-bold text-purple-600">{statistics.paymentStatusStats.pendingCount}</p>
                        </div>
                        <div className="text-center p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                            <p className="text-gray-600">Hoàn tiền</p>
                            <p className="font-bold text-cyan-600">{statistics.paymentStatusStats.refundedCount}</p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill="url(#colorPayment)" name="Doanh thu" radius={[8, 8, 0, 0]} />
                            <defs>
                                <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="#0891b2" stopOpacity={0.7}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs sm:text-sm">
                        <div className="text-center p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                            <p className="text-gray-600">Tiền mặt</p>
                            <p className="font-bold text-emerald-600">{statistics.paymentMethodStats.cashCount} HĐ</p>
                            <p className="text-xs text-gray-500">{statistics.paymentMethodStats.cashAmount.toLocaleString()}đ</p>
                        </div>
                        <div className="text-center p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                            <p className="text-gray-600">Chuyển khoản</p>
                            <p className="font-bold text-cyan-600">{statistics.paymentMethodStats.bankingCount} HĐ</p>
                            <p className="text-xs text-gray-500">{statistics.paymentMethodStats.bankingAmount.toLocaleString()}đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ doanh thu theo ngày */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Doanh thu 14 ngày gần nhất
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dailyRevenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                            formatter={(value: number) => `${value.toLocaleString()}đ`}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#a855f7" 
                            strokeWidth={3} 
                            name="Doanh thu"
                            dot={{ fill: '#a855f7', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="discount" 
                            stroke="#f97316" 
                            strokeWidth={3} 
                            name="Giảm giá"
                            dot={{ fill: '#f97316', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="netRevenue" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            name="Doanh thu ròng"
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts Row 2: Top Customers & Employees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 khách hàng */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-600" />
                        Top 5 khách hàng
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCustomersChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#6b7280" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Bar dataKey="value" fill="url(#colorCustomer)" name="Tổng chi tiêu" radius={[0, 8, 8, 0]} />
                            <defs>
                                <linearGradient id="colorCustomer" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.9}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {statistics.topCustomers.slice(0, 5).map((customer, index) => (
                            <div key={customer.customerId} className="flex items-center justify-between text-xs sm:text-sm p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 hover:border-pink-300 transition">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-pink-600">#{index + 1}</span>
                                    <div>
                                        <p className="font-medium">{customer.customerName}</p>
                                        <p className="text-gray-500 text-xs">{customer.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-pink-600">{customer.totalOrders} đơn</p>
                                    <p className="text-xs text-gray-500">{customer.totalSpent.toLocaleString()}đ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top 5 nhân viên */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Top 5 nhân viên
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topEmployeesChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#6b7280" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString()}đ`}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Bar dataKey="value" fill="url(#colorEmployee)" name="Tổng doanh thu" radius={[0, 8, 8, 0]} />
                            <defs>
                                <linearGradient id="colorEmployee" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.9}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {statistics.topEmployees.slice(0, 5).map((emp, index) => (
                            <div key={emp.employeeId} className="flex items-center justify-between text-xs sm:text-sm p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:border-amber-300 transition">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-600">#{index + 1}</span>
                                    <div>
                                        <p className="font-medium">{emp.employeeName}</p>
                                        <p className="text-gray-500 text-xs">@{emp.username}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-amber-600">{emp.totalInvoices} HĐ</p>
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
