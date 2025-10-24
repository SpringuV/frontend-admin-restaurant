"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function BankTransferPage() {
    const router = useRouter();
    const params = useSearchParams();

    const id_order = params.get("id_order");
    const total = params.get("total");
    const [status, setStatus] = useState<"PENDING" | "PAID" | "ERROR">("PENDING");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!id_order) return;

        // ✅ Kiểm tra biến môi trường
        const wsBackend = process.env.NEXT_PUBLIC_WS_BACKEND;
        console.log("🔧 WS_BACKEND from env:", wsBackend);

        if (!wsBackend) {
            console.error("❌ NEXT_PUBLIC_WS_BACKEND is not defined!");
            setStatus("ERROR");
            setErrorMessage("Chưa cấu hình WebSocket URL");
            return;
        }

        // ✅ Thử kết nối trực tiếp trước, fallback sang SockJS nếu lỗi
        // Option 1: WebSocket thuần (thử trước)
        const wsUrl = `${wsBackend}/ws/check-transfer`;
        
        // Option 2: SockJS fallback
        const sockJsUrl = `${wsBackend.replace('ws://', 'http://').replace('wss://', 'https://')}/ws/check-transfer`;
        
        console.log("🔌 Connecting to:", wsUrl);
        console.log("🔌 SockJS fallback:", sockJsUrl);
        
        let ws: WebSocket;
        
        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("✅ Connected to WebSocket");
                const payload = JSON.stringify({ order_id: id_order });
                console.log("📤 Sending:", payload);
                ws.send(payload);
            };

            ws.onmessage = (event) => {
                console.log("📩 WebSocket message:", event.data);
                
                try {
                    const data = JSON.parse(event.data);
                    console.log("📊 Parsed data:", data);

                    if (data.status === "PAID") {
                        setStatus("PAID");
                        ws.close();
                        alert("🎉 Thanh toán thành công!");
                        setTimeout(() => {
                            router.push("/booking");
                        }, 2000);
                    } else if (data.status === "listening") {
                        console.log("👂 Server is listening for order:", data.order_id);
                    } else if (data.error) {
                        console.error("⚠️ Server error:", data.error);
                        setStatus("ERROR");
                        setErrorMessage(data.error);
                    }
                } catch (err) {
                    console.error("⚠️ Error parsing message:", err);
                }
            };

            ws.onclose = (event) => {
                console.log("❌ WebSocket closed", {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                
                if (status === "PENDING") {
                    setStatus("ERROR");
                    setErrorMessage("Kết nối bị đóng");
                }
            };

            ws.onerror = (err) => {
                console.error("⚠️ WebSocket error:", err);
                setStatus("ERROR");
                setErrorMessage("Không thể kết nối đến server");
            };

        } catch (err) {
            console.error("❌ Failed to create WebSocket:", err);
            setStatus("ERROR");
            setErrorMessage("Không thể tạo kết nối WebSocket");
        }

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log("🔌 Closing WebSocket on cleanup");
                ws.close();
            }
        };
    }, [id_order, router, status]);

    if (!id_order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">❌ Không tìm thấy order!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <QrCode className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Chuyển khoản ngân hàng</h1>
                    <p className="text-gray-500 mt-2">Quét mã QR để thanh toán</p>
                </div>

                {/* QR Code */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <img
                        src={`https://qr.sepay.vn/img?acc=962471907021002&bank=BIDV&amount=${total}&des=ORDER${id_order}`}
                        alt="QR Code"
                        className="mx-auto w-full max-w-[280px] h-auto border-4 border-white rounded-lg shadow-lg"
                    />
                </div>

                {/* Order Info */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                        <span className="text-gray-800 font-bold">#{id_order}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Số tiền:</span>
                        <span className="text-3xl font-bold text-orange-600">
                            {Number(total).toLocaleString()}đ
                        </span>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm">
                    <p className="font-semibold text-gray-700 mb-2">Thông tin chuyển khoản:</p>
                    <div className="space-y-1 text-gray-600">
                        <p>• Ngân hàng: <strong>BIDV</strong></p>
                        <p>• Số tài khoản: <strong>962471907021002</strong></p>
                        <p>• Nội dung: <strong>ORDER{id_order}</strong></p>
                    </div>
                </div>

                {/* Status */}
                <div className="text-center">
                    {status === "PENDING" && (
                        <div className="flex items-center justify-center gap-3 text-yellow-600">
                            <Clock className="w-5 h-5 animate-spin" />
                            <p className="font-semibold">Đang chờ xác nhận thanh toán...</p>
                        </div>
                    )}
                    {status === "PAID" && (
                        <div className="flex items-center justify-center gap-3 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                            <p className="font-semibold text-lg">Thanh toán thành công!</p>
                        </div>
                    )}
                    {status === "ERROR" && (
                        <div className="flex flex-col items-center justify-center gap-3 text-red-600">
                            <AlertCircle className="w-6 h-6" />
                            <p className="font-semibold">Lỗi kết nối</p>
                            {errorMessage && (
                                <p className="text-sm text-gray-600">{errorMessage}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.push("/booking")}
                    className="w-full mt-6 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}