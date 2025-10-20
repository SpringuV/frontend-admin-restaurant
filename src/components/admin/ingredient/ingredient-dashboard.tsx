'use client'
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import Alert from '@/components/alert/alert';
import { AlertProps } from '@/lib/types';

const UNITS = ['KG', 'GRAM', 'CÁI', 'BÓ', 'THÙNG', 'HỘP', 'TÚI', 'CHIẾC', 'VIÊN', 'ĐÔI', 'LỌ', 'BÌNH'];

type IngredientType = {
    id_ingredient: string;
    name_ingredients: string;
    prices: number;
    quantity: number;
    unit_of_measurement: string;
    description: string;
    supplier: string;
    created_at: string;
};

const initialIngredients: IngredientType[] = [
    {
        id_ingredient: '1',
        name_ingredients: 'Thịt bò Úc',
        prices: 350000,
        quantity: 50,
        unit_of_measurement: 'KG',
        description: 'Thịt bò nhập khẩu từ Úc, chất lượng cao',
        supplier: 'Công ty TNHH Thực phẩm ABC',
        created_at: new Date().toISOString(),
    },
    {
        id_ingredient: '2',
        name_ingredients: 'Cà chua',
        prices: 25000,
        quantity: 100,
        unit_of_measurement: 'KG',
        description: 'Cà chua Đà Lạt tươi ngon',
        supplier: 'Nông trại Đà Lạt',
        created_at: new Date().toISOString(),
    },
];

export default function IngredientDashboard() {
    const [ingredients, setIngredients] = useState<IngredientType[]>(initialIngredients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [editingItem, setEditingItem] = useState<IngredientType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState<AlertProps | null>(null);

    const [formData, setFormData] = useState({
        name_ingredients: '',
        prices: '',
        quantity: '',
        unit_of_measurement: 'KG',
        description: '',
        supplier: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name_ingredients: '',
            prices: '',
            quantity: '',
            unit_of_measurement: 'KG',
            description: '',
            supplier: '',
        });
        setEditingItem(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalType('add');
        setIsModalOpen(true);
    };

    const openEditModal = (item: IngredientType) => {
        setEditingItem(item);
        setFormData({
            name_ingredients: item.name_ingredients,
            prices: item.prices.toString(),
            quantity: item.quantity.toString(),
            unit_of_measurement: item.unit_of_measurement,
            description: item.description || '',
            supplier: item.supplier || '',
        });
        setModalType('edit');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = () => {
        if (!formData.name_ingredients || !formData.prices || !formData.quantity) {
            setAlert({
                title: 'Lỗi',
                type: 'error',
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
                duration: 3000,
            });
            return;
        }

        if (editingItem) {
            setIngredients((prev) =>
                prev.map((item) =>
                    item.id_ingredient === editingItem.id_ingredient
                        ? {
                            ...item,
                            name_ingredients: formData.name_ingredients,
                            prices: parseFloat(formData.prices),
                            quantity: parseInt(formData.quantity, 10),
                            unit_of_measurement: formData.unit_of_measurement,
                            description: formData.description || '',
                            supplier: formData.supplier || '',
                        }
                        : item
                )
            );
            setAlert({
                title: 'Thành công',
                type: 'success',
                message: 'Cập nhật nguyên liệu thành công!',
                duration: 3000,
            });
        } else {
            const newIngredient: IngredientType = {
                id_ingredient: Date.now().toString(),
                name_ingredients: formData.name_ingredients,
                prices: parseFloat(formData.prices),
                quantity: parseInt(formData.quantity, 10),
                unit_of_measurement: formData.unit_of_measurement,
                description: formData.description || '',
                supplier: formData.supplier || '',
                created_at: new Date().toISOString(),
            };
            setIngredients((prev) => [...prev, newIngredient]);
            setAlert({
                title: 'Thành công',
                type: 'success',
                message: 'Thêm nguyên liệu thành công!',
                duration: 3000,
            });
        }

        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
            setIngredients((prev) => prev.filter((item) => item.id_ingredient !== id));
            setAlert({
                title: 'Thành công',
                type: 'success',
                message: 'Xóa nguyên liệu thành công!',
                duration: 3000,
            });
        }
    };

    const filteredIngredients = ingredients.filter(
        (item) =>
            item.name_ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = ingredients.reduce((sum, item) => sum + item.prices * item.quantity, 0);
    const lowStockItems = ingredients.filter((item) => item.quantity < 20).length;

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

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Nguyên Liệu</h1>
                    <p className="text-gray-600">Quản lý kho nguyên liệu và nhà cung cấp</p>
                </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Tổng nguyên liệu</p>
                                        <p className="text-3xl font-bold text-blue-600">{ingredients.length}</p>
                                    </div>
                                    <Package className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Giá trị kho</p>
                                        <p className="text-3xl font-bold text-green-600">{totalValue.toLocaleString()}đ</p>
                                    </div>
                                    <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Sắp hết hàng</p>
                                        <p className="text-3xl font-bold text-orange-600">{lowStockItems}</p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm nguyên liệu, nhà cung cấp..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <button
                                    onClick={openAddModal}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition whitespace-nowrap"
                                >
                                    <Plus className="w-5 h-5" />
                                    Thêm nguyên liệu
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Tên nguyên liệu</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Số lượng</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Đơn vị</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Nhà cung cấp</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredIngredients.map((item) => (
                                            <tr key={item.id_ingredient} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{item.name_ingredients}</p>
                                                        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">{item.prices.toLocaleString()}đ</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${item.quantity < 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                        {item.unit_of_measurement}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{item.supplier || '---'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id_ingredient)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                {/* Modal */}
                {isModalOpen && (
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <div 
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-xl flex-shrink-0">
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Giá (đ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="prices"
                                            value={formData.prices}
                                            onChange={handleInputChange}
                                            placeholder="350000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Số lượng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            placeholder="50"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhà cung cấp</label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        placeholder="VD: Công ty TNHH Thực phẩm ABC"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg transition"
                                    >
                                        {modalType === 'edit' ? 'Cập nhật' : 'Thêm mới'}
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