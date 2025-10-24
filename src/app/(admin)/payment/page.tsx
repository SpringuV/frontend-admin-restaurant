"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function BankTransferPage() {
    const router = useRouter();
    const params = useSearchParams();

    const id_order = params.get("id_order");
    const total = params.get("total");
    const [status, setStatus] = useState<"PENDING" | "PAID" | "ERROR">("PENDING");
    const [errorMessage, setErrorMessage] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("Đang kết nối...");
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!id_order) return;

        const wsBackend = process.env.NEXT_PUBLIC_WS_BACKEND || "ws://localhost:8080";
        const wsUrl = wsBackend.replace('http://', 'ws://').replace('https://', 'wss://');
        

        const ws = new WebSocket(`${wsUrl}/ws/checkTransfer`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("🔌 Connected to Polling WebSocket");
            console.log("📡 Endpoint: /ws/checkTransfer");
            console.log("⏱️  Polling interval: 5 seconds");
            setConnectionStatus("Đã kết nối - Đang kiểm tra thanh toán...");

            const message = JSON.stringify({ order_id: id_order });
            ws.send(message);
            console.log("📤 Sent order_id:", message);
        };

        ws.onmessage = (event) => {
            console.log("📩 Received WebSocket message:", event.data);

            try {
                const data = JSON.parse(event.data);
                console.log("📊 Parsed data:", data);
                console.log("🔍 Result:", data.result, "| Detail:", data.detail);

                if (data.result && data.detail === "") {
                    console.log("🎉 Payment confirmed!");
                    console.log("✅ Order status → COMPLETED");
                    console.log("✅ Invoice payment_status → PAID");
                    console.log("✅ Invoice payment_method → BANKING");
                    setStatus("PAID");
                    setConnectionStatus("Thanh toán thành công! Đang cập nhật đơn hàng...");

                    setTimeout(() => {
                        console.log("🔄 Redirecting to /booking...");
                        router.push("/booking");
                    }, 3000);

                } else if (!data.result) {
                    if (data.detail === "Waiting for payment") {
                        setConnectionStatus("Đang chờ thanh toán...");
                    } else if (data.detail === "Order cancelled") {
                        setStatus("ERROR");
                        setErrorMessage("Đơn hàng đã bị hủy");
                        setConnectionStatus("Đơn hàng đã hủy");
                        ws.close();
                    } else if (data.detail) {
                        setErrorMessage(data.detail);
                        setConnectionStatus(`Lỗi: ${data.detail}`);
                    }
                }

            } catch (err) {
                console.error(" Error parsing message:", err);
                setStatus("ERROR");
                setErrorMessage("Lỗi xử lý dữ liệu");
            }
        };

        ws.onclose = (event) => {
            console.log(" WebSocket closed:", event.code, event.reason);
            setConnectionStatus("Mất kết nối");
            if (status === "PENDING") {
                if (event.code === 1000) {
                    console.log(" Connection closed normally");
                } else {
                    setConnectionStatus("Mất kết nối");
                }
            }
        };

        ws.onerror = (error) => {
            console.error(" WebSocket error:", error);
            setStatus("ERROR");
            setErrorMessage("Không thể kết nối đến server");
            setConnectionStatus("Lỗi kết nối");
        };

        return () => {
            console.log(" Cleaning up WebSocket connection");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [id_order, router, status]);

    if (!id_order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 text-xl font-semibold">Không tìm thấy đơn hàng!</p>
                    <button
                        onClick={() => router.push("/booking")}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Chuyển khoản ngân hàng
                    </h1>
                    <p className="text-gray-500 mt-2">Quét mã QR hoặc chuyển khoản thủ công</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${status === "PAID" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}></div>
                        <span className="text-xs font-medium text-gray-600">
                            {status === "PAID" ? "Đã thanh toán" : "Đang chờ thanh toán"}
                        </span>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <img
                        src={`https://qr.sepay.vn/img?acc=962471907021002&bank=BIDV&amount=${total}&des=ORDER${id_order}`}
                        alt="QR Code"
                        className="mx-auto w-full max-w-[280px] h-auto border-4 border-white rounded-lg shadow-lg"
                    />
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-5 rounded-xl mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                        <span className="text-gray-800 font-bold text-lg">#{id_order}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Tổng tiền:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            {Number(total).toLocaleString()}đ
                        </span>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 text-sm">
                    <p className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Thông tin chuyển khoản:
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                            <span>Ngân hàng:</span>
                            <strong className="text-blue-700">BIDV</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Số tài khoản:</span>
                            <strong className="text-blue-700 font-mono">962471907021002</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Nội dung:</span>
                            <strong className="text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                                ORDER{id_order}
                            </strong>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 italic">
                            ⚠️ Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận
                        </p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    {status === "PENDING" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-3 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <Clock className="w-5 h-5 animate-spin" />
                                <p className="font-semibold">Đang chờ xác nhận thanh toán...</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <p className="text-xs text-gray-600 font-medium">Trạng thái kết nối:</p>
                                <p className="text-sm text-gray-700">{connectionStatus}</p>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span>Đang kiểm tra mỗi 5 giây</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {status === "PAID" && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center gap-3 text-green-600 animate-bounce">
                                <CheckCircle className="w-8 h-8" />
                                <p className="font-bold text-xl">Thanh toán thành công!</p>
                            </div>
                            
                            {/* Payment confirmation details */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Đơn hàng đã được xác nhận</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Hóa đơn đã được thanh toán</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Phương thức: Chuyển khoản ngân hàng</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                Đang chuyển về trang đặt bàn...
                            </p>
                        </div>
                    )}
                    {status === "ERROR" && (
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                    <AlertCircle className="w-6 h-6" />
                                    <p className="font-semibold">Có lỗi xảy ra</p>
                                </div>
                                {errorMessage && (
                                    <p className="text-sm text-red-700 ml-9">{errorMessage}</p>
                                )}
                                <p className="text-xs text-red-600 mt-2 ml-9">{connectionStatus}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => router.push("/booking")}
                    className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
                >
                    ← Quay lại trang đặt bàn
                </button>

                {/* Footer info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        🔒 Giao dịch được bảo mật bởi Sepay
                    </p>
                </div>
            </div>
        </div>
    );
}
