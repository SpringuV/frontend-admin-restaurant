// Ví dụ sử dụng tính năng Delete Ingredient với Mapping

/*
✅ TÍNH NĂNG MỚI: Delete Ingredient với Mapping

🔧 Cách hoạt động:
1. Khi xóa ingredient, hệ thống sẽ:
   - Gọi API DELETE /api/ingredients/{id}/mapping trước
   - Sau đó gọi API DELETE /api/ingredients/{id}
   - Trả về kết quả kết hợp

2. Response mới:
   {
     "code": 200,
     "message": "Success",
     "result": {
       "is_deleted": true,
       "mapping_deleted": true
     }
   }

3. UI sẽ hiển thị:
   - "Xóa nguyên liệu thành công! Đã xóa mapping liên quan." (nếu có mapping)
   - "Xóa nguyên liệu thành công!" (nếu không có mapping)

📋 API Endpoints được gọi:
- DELETE /api/ingredients/{id}/mapping - Xóa mapping
- DELETE /api/ingredients/{id} - Xóa ingredient

⚠️ Lưu ý:
- Confirm dialog sẽ cảnh báo: "Việc này sẽ xóa cả mapping liên quan"
- Nếu mapping API lỗi, ingredient vẫn có thể được xóa
- Response sẽ cho biết mapping có được xóa thành công hay không

🎯 Use Cases:
- Xóa ingredient và tất cả mapping với food items
- Xóa ingredient và mapping với suppliers
- Xóa ingredient và mapping với inventory records
*/
