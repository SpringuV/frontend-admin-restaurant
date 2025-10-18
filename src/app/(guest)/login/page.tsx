'use client'
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [forgotEmail, setForgotEmail] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            console.log('Đăng nhập:', formData);
            setIsLoading(false);
            alert('Đăng nhập thành công!');
        }, 1000);
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            console.log('Gửi yêu cầu đặt lại mật khẩu cho:', forgotEmail);
            setIsLoading(false);
            alert('Vui lòng kiểm tra email để đặt lại mật khẩu!');
            setShowForgotForm(false);
            setForgotEmail('');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-400 to-yellow-300 flex items-center justify-center p-4">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full opacity-10"></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            🍜
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-gray-900">
                        {showForgotForm ? 'Quên Mật Khẩu' : 'Đăng Nhập'}
                    </CardTitle>
                    <CardDescription>
                        {showForgotForm 
                            ? 'Nhập email của bạn để đặt lại mật khẩu' 
                            : 'Đăng nhập vào tài khoản quản lý nhà hàng'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!showForgotForm ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@nhaang.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">Mật Khẩu</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <button
                                type="button"
                                onClick={() => setShowForgotForm(true)}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Quên mật khẩu?
                            </button>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 h-10"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {/* Email Field for Forgot Password */}
                            <div className="space-y-2">
                                <Label htmlFor="forgot-email" className="text-gray-700">Email của bạn</Label>
                                <Input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="admin@nhaang.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>

                            <p className="text-sm text-gray-600">
                                Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                            </p>

                            {/* Buttons */}
                            <div className="space-y-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 h-10"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang gửi...' : 'Gửi Hướng Dẫn'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => {
                                        setShowForgotForm(false);
                                        setForgotEmail('');
                                    }}
                                >
                                    Quay Lại
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;