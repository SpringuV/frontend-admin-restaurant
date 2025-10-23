'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft } from 'lucide-react';
import Alert from '@/components/alert/alert';
import { AlertProps, IngredientType, UnitOfMeasurement } from '@/lib/types';
import {
    useCreateIngredient,
    useUpdateIngredient,
    useDeleteIngredient,
    useLoadIngredients
} from '@/hooks/ingredient';
import { formatInstantToVietnamese } from '@/utils/date-utils';
import { useConfirmDialog } from '@/hooks/hook-client';
import ConfirmDialog from '@/components/modal/confirm-dialog';

const UNITS = Object.values(UnitOfMeasurement);

export default function IngredientDashboard() {
    // Load tất cả ingredients (master data)
    const { ingredients, isLoading, error, reload } = useLoadIngredients();
    const { createIngredient, isLoading: createLoading } = useCreateIngredient();
    const { updateIngredient, isLoading: updateLoading } = useUpdateIngredient();
    const { deleteIngredient, isLoading: deleteLoading } = useDeleteIngredient();
    const { isOpenDialog, config, showConfirm, hideConfirm } = useConfirmDialog();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [editingItem, setEditingItem] = useState<IngredientType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState<AlertProps | null>(null);

    const [formData, setFormData] = useState({
        name_ingredients: '',
        prices: '',
        unit_of_measurement: UnitOfMeasurement.KG,
        description: '',
        supplier: '',
    });

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'unit_of_measurement' ? value as UnitOfMeasurement : value
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name_ingredients: '',
            prices: '',
            unit_of_measurement: UnitOfMeasurement.KG,
            description: '',
            supplier: '',
        });
        setEditingItem(null);
    }, []);

    const openAddModal = useCallback(() => {
        resetForm();
        setModalType('add');
        setIsModalOpen(true);
    }, [resetForm]);

    const openEditModal = useCallback((item: IngredientType) => {
        setEditingItem(item);
        setFormData({
            name_ingredients: item.name_ingredients,
            prices: item.prices.toString(),
            unit_of_measurement: item.unit_of_measurement,
            description: item.description || '',
            supplier: item.supplier || '',
        });
        setModalType('edit');
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        resetForm();
    }, [resetForm]);

    const handleSubmit = async () => {
        if (!formData.name_ingredients || !formData.prices) {
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
                duration: 3000,
            });
            return;
        }

        try {
            if (editingItem) {
                await updateIngredient({
                    id_ingredient: editingItem.id_ingredient,
                    prices: parseFloat(formData.prices),
                    unit_of_measurement: formData.unit_of_measurement,
                    description: formData.description || undefined,
                    supplier: formData.supplier || undefined,
                });
                setAlert({
                    title: 'Thành công',
                    type: 'success',
                    message: 'Cập nhật nguyên liệu thành công!',
                    duration: 3000,
                });
            } else {
                await createIngredient({
                    name_ingredients: formData.name_ingredients,
                    prices: parseFloat(formData.prices),
                    unit_of_measurement: formData.unit_of_measurement,
                    description: formData.description || undefined,
                    supplier: formData.supplier || undefined,
                });
                setAlert({
                    title: 'Thành công',
                    type: 'success',
                    message: 'Thêm nguyên liệu thành công!',
                    duration: 3000,
                });
            }
            closeModal();
        } catch (err) {
            console.error('Lỗi khi xử lý ingredient:', err);
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Có lỗi xảy ra khi xử lý nguyên liệu!',
                duration: 3000,
            });
        }
    };

    const handleRowClick = useCallback((item: IngredientType) => {
        showConfirm({
            title: 'Xóa nguyên liệu',
            message: `Bạn có chắc muốn xóa nguyên liệu "${item.name_ingredients}"?`,
            confirmText: 'Xóa',
            type: 'danger',
            onConfirm: () => {
                handleDelete(item.id_ingredient)
            }
        });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const response = await deleteIngredient(id);
            if (response?.result.is_deleted) {
                setAlert({
                    title: 'Thành công',
                    type: 'success',
                    message: 'Xóa nguyên liệu thành công!',
                    duration: 3000,
                });
            } else {
                setAlert({
                    title: 'Cảnh báo',
                    type: 'warning',
                    message: 'Xóa nguyên liệu không thành công!',
                    duration: 3000,
                });
            }
        } catch (err) {
            console.error('Lỗi khi xóa ingredient:', err);
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Có lỗi xảy ra khi xóa nguyên liệu!',
                duration: 3000,
            });
        }
    }, [deleteIngredient]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(
            (item: IngredientType) =>
                item.name_ingredients?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ingredients, searchTerm]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => reload()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            {alert && (
                <Alert
                    title={alert.title}
                    type={alert.type}
                    message={alert.message}
                    duration={alert.duration}
                    onClose={() => setAlert(null)}
                />
            )}
            <ConfirmDialog
                isOpenDialog={isOpenDialog}
                onClose={hideConfirm}
                {...config}
                onConfirm={config.onConfirm ?? (() => { })}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Nguyên Liệu</h1>
                    <p className="text-gray-600">Danh sách nguyên liệu master (không bao gồm số lượng tồn kho)</p>
                </div>

                {/* Statistics Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng số loại nguyên liệu</p>
                            <p className="text-3xl font-bold text-blue-600">{ingredients.length}</p>
                        </div>
                        <Package className="w-12 h-12 text-blue-500 opacity-20" />
                    </div>
                </div>

                {/* Search and Add Button */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nguyên liệu, nhà cung cấp..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 items-center">
                            <div className="text-sm text-gray-500 text-center md:text-right">
                                💡 Click vào dòng để xóa nguyên liệu
                            </div>
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg transition whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm nguyên liệu
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-500 to-rose-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">STT</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên nguyên liệu</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Giá tham chiếu</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Đơn vị</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Nhà cung cấp</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredIngredients.map((item: IngredientType, index: number) => (
                                    <tr
                                        key={item.id_ingredient}
                                        className="hover:bg-red-50 hover:cursor-pointer transition-all duration-200 hover:shadow-md"
                                        onClick={() => handleRowClick(item)}
                                        title="Click để xóa nguyên liệu này"
                                    >
                                        <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.name_ingredients}</p>
                                                {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-green-600 font-semibold">{item.prices.toLocaleString()}đ</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                {item.unit_of_measurement}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{item.supplier || '---'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(item);
                                                    }}
                                                    disabled={updateLoading || deleteLoading}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(item);
                                                    }}
                                                    disabled={deleteLoading || updateLoading}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredIngredients.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Không tìm thấy nguyên liệu nào</p>
                        </div>
                    )}
                </div>

                {/* Modal add and edit */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-xl flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="p-2 hover:bg-white/20 rounded-lg transition"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-2xl font-bold">
                                        {modalType === 'edit' ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                {/* Hiển thị mã nguyên vật liệu và ngày tạo khi edit */}
                                {modalType === 'edit' && editingItem && (
                                    <>
                                        <div className='p-4 bg-gray-50 rounded-lg'>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mã nguyên vật liệu
                                            </label>
                                            <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono">
                                                {editingItem.id_ingredient}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Ngày tạo
                                                </label>
                                                <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                                                    {formatInstantToVietnamese(editingItem.created_at)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Cập nhật lần cuối
                                                </label>
                                                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                                                    {formatInstantToVietnamese(editingItem.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên nguyên liệu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name_ingredients"
                                        value={formData.name_ingredients}
                                        onChange={handleInputChange}
                                        placeholder="VD: Thịt bò Úc"
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
                                            ${modalType === 'edit' ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`}
                                        disabled={modalType === 'edit'}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Giá tham chiếu (đ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="prices"
                                            min={0}
                                            step={10000}
                                            max={2500000000}
                                            value={formData.prices}
                                            onChange={handleInputChange}
                                            placeholder="350000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Đơn vị đo <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="unit_of_measurement"
                                            value={formData.unit_of_measurement}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            {UNITS.map((unit) => (
                                                <option key={unit} value={unit}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhà cung cấp</label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        placeholder="VD: Công ty TNHH Thực phẩm ABC"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Mô tả chi tiết về nguyên liệu..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={createLoading || updateLoading}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {(createLoading || updateLoading) && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        {modalType === 'edit'
                                            ? (updateLoading ? 'Đang cập nhật...' : 'Cập nhật')
                                            : (createLoading ? 'Đang thêm...' : 'Thêm mới')
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}