/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownToLine, ArrowUpFromLine, Package, Building2, Truck, Loader2 } from 'lucide-react';
import { AlertProps, ImportExportRequest, WarehouseType } from '@/lib/types';
import Alert from '@/components/alert/alert';
import { cn, getUserIdFromStorage } from '@/lib/utils';
import { useLoadSupplierAndIngredient } from '@/hooks/ingredient';
import { useLoadWarehouses } from '@/hooks/ware-house';
import { CreateImportExportResponse, useCreateImportExport } from '@/hooks/inventory-transaction';

interface IngredientWarehouseResponse {
    name_ingredients: string;
    prices: number;
    quantity: number;
}

interface IngredientOfSupplierResponse {
    name_supplier: string;
    ingredient_of_warehouse: IngredientWarehouseResponse[];
}


const ImportExport = () => {
    const [transactionType, setTransactionType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [quantity, setQuantity] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [note, setNote] = useState('');
    const [alert, setAlert] = useState<AlertProps | null>(null);
    const [availableIngredients, setAvailableIngredients] = useState<IngredientWarehouseResponse[]>([]);
    const [selectedIngredientDetails, setSelectedIngredientDetails] = useState<IngredientWarehouseResponse | null>(null);

    // Load warehouses
    const { warehouses, loadingWarehouses, warehouseError } = useLoadWarehouses();

    // Load suppliers and ingredients based on selected warehouse
    const { supplier_and_ingredients, loadingSupplier, supplierError, reloadSupplier } = useLoadSupplierAndIngredient(selectedWarehouse ?? undefined);

    const { createImportExport, loading: submitting, error: submitError } = useCreateImportExport();

    // Extract suppliers list from API response
    const suppliers: IngredientOfSupplierResponse[] = useMemo(() => {
        if (!supplier_and_ingredients?.result || !selectedWarehouse) return [];
        return supplier_and_ingredients.result;
    }, [supplier_and_ingredients, selectedWarehouse]);

    // Handle supplier selection and load ingredients
    useEffect(() => {
        if (selectedSupplier && suppliers.length > 0) {
            const supplierData = suppliers.find(
                (sup: IngredientOfSupplierResponse) => sup.name_supplier === selectedSupplier
            );
            setAvailableIngredients(supplierData?.ingredient_of_warehouse || []);
            setSelectedIngredient('');
            setSelectedIngredientDetails(null);
        } else {
            setAvailableIngredients([]);
        }
    }, [selectedSupplier, suppliers]);

    // Handle ingredient selection
    useEffect(() => {
        if (selectedIngredient) {
            const ingredient = availableIngredients.find(
                (ing: IngredientWarehouseResponse) => ing.name_ingredients === selectedIngredient
            );
            setSelectedIngredientDetails(ingredient || null);
        } else {
            setSelectedIngredientDetails(null);
        }
    }, [selectedIngredient, availableIngredients]);

    const handleReset = () => {
        setSelectedWarehouse('');
        setSelectedSupplier('');
        setSelectedIngredient('');
        setQuantity('');
        setNote('');
        setErrorMessage('');
        setSelectedIngredientDetails(null);
    };

    const handleSubmit = async () => {

        if (!selectedWarehouse) {
            setAlert({
                title: 'Lỗi',
                message: "Bạn chưa chọn nhà kho",
                type: 'error'
            });
            return;
        }

        if (!isFormValid) return;

        const selectedWarehouseData = warehouses?.find(
            (wh: WarehouseType) => wh.code_warehouse === selectedWarehouse
        );

        const requestData: ImportExportRequest = {
            code_warehouse: selectedWarehouseData?.code_warehouse || '',
            name_supplier: selectedSupplier,
            name_ingredients: selectedIngredient,
            quantity: parseInt(quantity),
            note: note || '',
            type: transactionType,
            id_user: getUserIdFromStorage() || ''
        };

        try {
            const response: CreateImportExportResponse | ImportExportRequest | undefined = await createImportExport(requestData);

            if (response && 'result' in response && response.result?.is_created) {
                setAlert({
                    title: 'Thành công',
                    message: response.result.message || `${transactionType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'} thành công!`,
                    type: 'success'
                });

                setTimeout(() => {
                    handleReset()
                    reloadSupplier()
                }, 2000)
            }
        } catch (error: any) {
            setAlert({
                title: 'Lỗi',
                message: error.message || 'Có lỗi xảy ra khi xử lý giao dịch',
                type: 'error'
            });
        }
    };

    const isFormValid =
        selectedWarehouse &&
        selectedSupplier &&
        selectedIngredient &&
        quantity &&
        parseInt(quantity) > 0 &&
        !errorMessage;

    // Loading state
    if (loadingWarehouses) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-xl border-0">
                    <CardContent className="p-12 flex justify-center items-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                            <p className="text-gray-600 font-semibold">Đang tải dữ liệu...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (warehouseError) {
        return (
            <div className="max-w-4xl mx-auto">
                <Alert
                    title="Lỗi"
                    message="Không thể tải dữ liệu. Vui lòng thử lại sau."
                    type="error"
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {alert && (
                <Alert
                    message={alert.message}
                    title={alert.title}
                    type={alert.type}
                    duration={alert.duration}
                    icon={alert.icon}
                    onClose={() => setAlert(null)}
                />
            )}
            <Card className="shadow-xl border-0 pt-0">
                <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
                    <CardTitle className="text-2xl pt-2 font-bold flex justify-center items-center gap-3">
                        <Package className="w-8 h-8" />
                        Quản Lý Nhập/Xuất Kho
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                    <div className="mb-8">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Loại giao dịch
                        </Label>
                        <div className="grid grid-cols-2 gap-6">
                            <Button
                                type="button"
                                onClick={() => {
                                    setTransactionType('IMPORT');
                                    handleReset();
                                }}
                                className={cn(
                                    "!p-0 flex-1 h-10 text-base font-semibold transition-all",
                                    transactionType === "IMPORT"
                                        ? "bg-green-600 hover:bg-green-700 shadow-lg scale-105"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                )}
                            >
                                <ArrowDownToLine className="w-5 h-5 mr-2" />
                                Nhập Kho
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setTransactionType('EXPORT');
                                    handleReset();
                                }}
                                className={cn(
                                    "!p-0 flex-1 h-10 text-base font-semibold transition-all",
                                    transactionType === "EXPORT"
                                        ? "bg-orange-600 hover:bg-orange-700 shadow-lg scale-105"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                )}
                            >
                                <ArrowUpFromLine className="w-5 h-5 mr-2" />
                                Xuất Kho
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            {/* Step 1: Warehouse Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="warehouse" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    Bước 1: Chọn Kho
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedWarehouse}
                                    onValueChange={(value) => {
                                        setSelectedWarehouse(value);
                                        setSelectedSupplier('');
                                        setSelectedIngredient('');
                                        setQuantity('');
                                        setNote('');
                                        setErrorMessage('');
                                    }}
                                >
                                    <SelectTrigger className="!h-16 border-2 text-wrap text-center !py-1 w-full focus:border-blue-500">
                                        <SelectValue placeholder="-- Chọn kho --" />
                                    </SelectTrigger>
                                    <SelectContent className="!py-1">
                                        {warehouses?.map((wh: WarehouseType) => (
                                            <SelectItem key={wh.code_warehouse} value={wh.code_warehouse}>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {wh.code_warehouse} - {wh.name_warehouse}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {wh.address_warehouse}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Step 2: Supplier Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                    Bước 2: Chọn Nhà Cung Cấp
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedSupplier}
                                    onValueChange={(value) => {
                                        setSelectedSupplier(value);
                                        setSelectedIngredient('');
                                    }}
                                    disabled={!selectedWarehouse || loadingSupplier}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "!h-16 border-2 w-full text-wrap text-center",
                                            !selectedWarehouse || loadingSupplier
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "focus:border-blue-500"
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={
                                                loadingSupplier
                                                    ? "Đang tải..."
                                                    : selectedWarehouse
                                                        ? "-- Chọn nhà cung cấp --"
                                                        : "Vui lòng chọn kho trước"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((sup: IngredientOfSupplierResponse) => (
                                            <SelectItem key={sup.name_supplier} value={sup.name_supplier}>
                                                {sup.name_supplier}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Step 3: Ingredient Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="ingredient" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-blue-600" />
                                    Bước 3: Chọn Nguyên Liệu
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedIngredient}
                                    onValueChange={setSelectedIngredient}
                                    disabled={!selectedSupplier}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "!h-16 border-2 text-wrap text-center w-full",
                                            !selectedSupplier
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "focus:border-blue-500"
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={
                                                selectedSupplier
                                                    ? "-- Chọn nguyên liệu --"
                                                    : "Vui lòng chọn nhà cung cấp trước"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableIngredients.map((ing: IngredientWarehouseResponse) => (
                                            <SelectItem
                                                key={ing.name_ingredients}
                                                value={ing.name_ingredients}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{ing.name_ingredients}</span>
                                                    <span className="text-xs text-gray-500">
                                                        Giá: {ing.prices.toLocaleString('vi-VN')}đ | Tồn kho:{' '}
                                                        {ing.quantity}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Ingredient Details Card */}
                        {selectedIngredientDetails && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">
                                        Thông tin nguyên liệu
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Tên:</span>
                                            <span className="ml-2 font-semibold">
                                                {selectedIngredientDetails.name_ingredients}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Giá:</span>
                                            <span className="ml-2 font-semibold text-green-700">
                                                {selectedIngredientDetails.prices.toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tồn kho hiện tại:</span>
                                            <span className="ml-2 font-semibold text-blue-700">
                                                {selectedIngredientDetails.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Quantity Input */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                                Bước 4: Số Lượng {transactionType === 'IMPORT' ? 'Nhập' : 'Xuất'}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="text"
                                inputMode="numeric"
                                value={quantity}
                                onKeyDown={(e) => {
                                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                        setQuantity("");
                                        setErrorMessage("");
                                        return;
                                    }

                                    if (!/^\d+$/.test(value)) {
                                        setErrorMessage("Vui lòng chỉ nhập số!");
                                        return;
                                    }

                                    const numValue = parseInt(value);
                                    if (transactionType === 'EXPORT' && selectedIngredientDetails) {
                                        if (numValue > selectedIngredientDetails.quantity) {
                                            setErrorMessage(
                                                `Số lượng xuất không được vượt quá tồn kho (${selectedIngredientDetails.quantity})`
                                            );
                                        } else {
                                            setErrorMessage("");
                                        }
                                    } else {
                                        setErrorMessage("");
                                    }

                                    setQuantity(value);
                                }}
                                placeholder="Nhập số lượng"
                                disabled={!selectedIngredient}
                                className={cn(
                                    "h-12 border-2 text-lg",
                                    !selectedIngredient ? "bg-gray-100" : "focus:border-blue-500"
                                )}
                            />

                            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                            {quantity && selectedIngredientDetails && !errorMessage && (
                                <p className="text-sm text-gray-600">
                                    Tổng giá trị:{' '}
                                    <span className="font-bold text-green-600">
                                        {(parseInt(quantity) * selectedIngredientDetails.prices).toLocaleString(
                                            'vi-VN'
                                        )}
                                        đ
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                            <Label htmlFor="note" className="text-sm font-semibold text-gray-700">
                                Ghi Chú (Tùy chọn)
                            </Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập ghi chú về giao dịch này..."
                                disabled={!selectedIngredient}
                                className={cn(
                                    "border-2 min-h-24",
                                    !selectedIngredient ? "bg-gray-100" : "focus:border-blue-500"
                                )}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={handleReset}
                                variant="outline"
                                className="flex-1 h-12 text-base font-semibold border-2 hover:bg-gray-100"
                            >
                                Làm Mới
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isFormValid || submitting}
                                className={cn(
                                    "flex-1 h-12 text-base font-semibold",
                                    transactionType === 'IMPORT'
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-orange-600 hover:bg-orange-700",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    transactionType === 'IMPORT' ? 'Xác Nhận Nhập Kho' : 'Xác Nhận Xuất Kho'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImportExport;