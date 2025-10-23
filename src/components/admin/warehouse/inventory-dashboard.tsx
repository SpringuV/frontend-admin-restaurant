'use client'
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Building2, Eye, ArrowDownToLine, ArrowUpFromLine, Calendar, User, FileText } from 'lucide-react';
import { useLoadInventories, useLoadWarehouses } from '@/hooks/ware-house';
import { LoadInventoryTransactionResponse, WarehouseType } from '@/lib/types';
import { formatInstantToVietnamese } from '@/utils/date-utils';

const InventoryHistory = () => {
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [selectedTransaction, setSelectedTransaction] = useState<LoadInventoryTransactionResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Load warehouses
    const { warehouses, loadingWarehouses, warehouseError } = useLoadWarehouses();

    // Load transactions for selected warehouse
    const {transactions, loadingInventories, inventoriesError, reloadInventories} = useLoadInventories(selectedWarehouse || null);

    // Calculate statistics
    const statistics = useMemo(() => {
        const importTransactions = transactions.filter((t: LoadInventoryTransactionResponse) => t.type === 'IMPORT');
        const exportTransactions = transactions.filter((t: LoadInventoryTransactionResponse) => t.type === 'EXPORT');

        const totalImport = importTransactions.reduce(
            (sum: number, t: LoadInventoryTransactionResponse) => sum + t.quantity,
            0
        );

        const totalExport = exportTransactions.reduce(
            (sum: number, t: LoadInventoryTransactionResponse) => sum + t.quantity,
            0
        );

        const totalImportValue = importTransactions.reduce(
            (sum: number, t: LoadInventoryTransactionResponse) => sum + (t.quantity * t.ingredient_response.prices),
            0
        );

        const totalExportValue = exportTransactions.reduce(
            (sum: number, t: LoadInventoryTransactionResponse) => sum + (t.quantity * t.ingredient_response.prices),
            0
        );

        return {
            totalTransactions: transactions.length,
            importCount: importTransactions.length,
            exportCount: exportTransactions.length,
            totalImport,
            totalExport,
            totalImportValue,
            totalExportValue,
        };
    }, [transactions]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const handleViewDetail = (transaction: LoadInventoryTransactionResponse) => {
        setSelectedTransaction(transaction);
        setIsDetailOpen(true);
    };

    const handleWarehouseChange = (value: string) => {
        setSelectedWarehouse(value);
        setSelectedTransaction(null);
    };

    const getTypeBadge = (type: 'IMPORT' | 'EXPORT') => {
        if (type === 'IMPORT') {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <ArrowDownToLine className="w-3 h-3 mr-1" />
                    Nhập Kho
                </Badge>
            );
        }
        return (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                <ArrowUpFromLine className="w-3 h-3 mr-1" />
                Xuất Kho
            </Badge>
        );
    };

    // Loading warehouses
    if (loadingWarehouses) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="shadow-lg border-0">
                    <CardContent className="p-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error loading warehouses
    if (warehouseError) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="shadow-lg border-0">
                    <CardContent className="p-6">
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                            Không thể tải danh sách kho. Vui lòng thử lại sau.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Card className="pt-0 shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r pt-3 from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <Package className="w-8 h-8" />
                        Lịch Sử Giao Dịch Kho
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Warehouse Selection */}
                    <div className="mb-6 flex justify-evenly items-center">
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Chọn Kho Để Xem Lịch Sử
                            <span className="text-red-500">*</span>
                        </label>
                        <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                            <SelectTrigger className="h-16 border-2 focus:border-blue-500">
                                <SelectValue placeholder="-- Chọn kho để xem lịch sử giao dịch --" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((wh: WarehouseType) => (
                                    <SelectItem key={wh.code_warehouse} value={wh.code_warehouse}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">
                                                {wh.code_warehouse} - {wh.name_warehouse}
                                            </span>
                                            <span className="text-xs text-gray-500">{wh.address_warehouse}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loading State */}
                    {loadingInventories && (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}

                    {/* Error State */}
                    {inventoriesError && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
                            {inventoriesError instanceof Error
                                ? inventoriesError.message
                                : 'Có lỗi xảy ra khi tải dữ liệu'}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loadingInventories && !selectedWarehouse && (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">Vui lòng chọn kho để xem lịch sử giao dịch</p>
                        </div>
                    )}

                    {/* No Transactions */}
                    {!loadingInventories && selectedWarehouse && transactions.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">Chưa có giao dịch nào trong kho này</p>
                        </div>
                    )}

                    {/* Transactions Table */}
                    {!loadingInventories && selectedWarehouse && transactions.length > 0 && (
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left font-bold text-sm">Loại</th>
                                        <th className="px-4 py-3 text-left font-bold text-sm">Nguyên Liệu</th>
                                        <th className="px-4 py-3 text-right font-bold text-sm">Số Lượng</th>
                                        <th className="px-4 py-3 text-right font-bold text-sm">Đơn Giá</th>
                                        <th className="px-4 py-3 text-right font-bold text-sm">Tổng Tiền</th>
                                        <th className="px-4 py-3 text-left font-bold text-sm">Người Thực Hiện</th>
                                        <th className="px-4 py-3 text-left font-bold text-sm">Thời Gian</th>
                                        <th className="px-4 py-3 text-center font-bold text-sm">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction: LoadInventoryTransactionResponse) => (
                                        <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">{getTypeBadge(transaction.type)}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {transaction.ingredient_response.name_ingredients}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Đơn vị: {transaction.ingredient_response.unit_of_measurement}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {transaction.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatCurrency(transaction.ingredient_response.prices)}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold ${
                                                transaction.type === 'IMPORT' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                                {formatCurrency(transaction.quantity * transaction.ingredient_response.prices)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {transaction.user_response.full_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    {formatInstantToVietnamese(transaction.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetail(transaction)}
                                                    className="hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Chi Tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Enhanced Summary Statistics */}
                    {!loadingInventories && selectedWarehouse && transactions.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {/* Overview */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Tổng Quan
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tổng Giao Dịch</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {statistics.totalTransactions}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Giao Dịch Nhập</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {statistics.importCount}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Giao Dịch Xuất</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {statistics.exportCount}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Import Statistics */}
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                    <ArrowDownToLine className="w-5 h-5" />
                                    Thống Kê Nhập Kho
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tổng Số Lượng Nhập</div>
                                        <div className="text-xl font-bold text-green-700">
                                            {statistics.totalImport}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tổng Giá Trị Nhập</div>
                                        <div className="text-xl font-bold text-green-700">
                                            {formatCurrency(statistics.totalImportValue)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Export Statistics */}
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                                    <ArrowUpFromLine className="w-5 h-5" />
                                    Thống Kê Xuất Kho
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tổng Số Lượng Xuất</div>
                                        <div className="text-xl font-bold text-orange-700">
                                            {statistics.totalExport}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tổng Giá Trị Xuất</div>
                                        <div className="text-xl font-bold text-orange-700">
                                            {formatCurrency(statistics.totalExportValue)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net Balance */}
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-3">Chênh Lệch</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Chênh Lệch Số Lượng</div>
                                        <div className={`text-xl font-bold ${
                                            (statistics.totalImport - statistics.totalExport) >= 0 
                                                ? 'text-green-700' 
                                                : 'text-red-700'
                                        }`}>
                                            {statistics.totalImport - statistics.totalExport > 0 ? '+' : ''}
                                            {statistics.totalImport - statistics.totalExport}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Chênh Lệch Giá Trị</div>
                                        <div className={`text-xl font-bold ${
                                            (statistics.totalImportValue - statistics.totalExportValue) >= 0 
                                                ? 'text-green-700' 
                                                : 'text-red-700'
                                        }`}>
                                            {formatCurrency(Math.abs(statistics.totalImportValue - statistics.totalExportValue))}
                                            {(statistics.totalImportValue - statistics.totalExportValue) >= 0 ? ' (Dương)' : ' (Âm)'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                    {/* Header - Fixed */}
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            Chi Tiết Giao Dịch
                        </DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    {selectedTransaction && (
                        <div className="overflow-y-auto px-6 py-4">
                            <div className="space-y-4">
                                {/* Transaction Type Badge */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-semibold text-gray-700">Loại Giao Dịch:</span>
                                    {getTypeBadge(selectedTransaction.type)}
                                </div>

                                {/* Ingredient Info */}
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Thông Tin Nguyên Liệu
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Tên nguyên liệu:</span>
                                            <span className="ml-2 font-semibold">
                                                {selectedTransaction.ingredient_response.name_ingredients}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Nhà cung cấp:</span>
                                            <span className="ml-2 font-semibold">
                                                {selectedTransaction.ingredient_response.supplier}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Đơn vị:</span>
                                            <span className="ml-2 font-semibold">
                                                {selectedTransaction.ingredient_response.unit_of_measurement}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Số lượng:</span>
                                            <span className="ml-2 font-bold text-green-700">
                                                {selectedTransaction.quantity}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Đơn giá:</span>
                                            <span className="ml-2 font-semibold">
                                                {formatCurrency(selectedTransaction.ingredient_response.prices)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tổng giá trị:</span>
                                            <span className={`ml-2 font-bold text-lg ${
                                                selectedTransaction.type === 'IMPORT' ? 'text-green-700' : 'text-orange-700'
                                            }`}>
                                                {formatCurrency(
                                                    selectedTransaction.quantity * selectedTransaction.ingredient_response.prices
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Người Thực Hiện
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Họ tên:</span>
                                            <span className="ml-2 font-semibold">
                                                {selectedTransaction.user_response.full_name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Mã người dùng:</span>
                                            <span className="ml-2 font-semibold">
                                                @{selectedTransaction.user_response.id_user}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Thời Gian Thực Hiện
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">
                                            {formatInstantToVietnamese(selectedTransaction.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Note */}
                                {selectedTransaction.note && (
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="font-semibold text-yellow-900 mb-2">Ghi Chú</div>
                                        <p className="text-sm text-gray-700">{selectedTransaction.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer - Fixed */}
                    <div className="px-6 py-4 border-t">
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setIsDetailOpen(false)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InventoryHistory;