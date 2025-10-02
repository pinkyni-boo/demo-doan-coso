// Test script để kiểm tra API maintenance cho trainer
// Chạy file này để test endpoint mới

const testMaintenanceAPI = async () => {
  try {
    // Giả sử bạn đã có token từ việc đăng nhập
    const token = "YOUR_TOKEN_HERE"; // Thay bằng token thực

    const response = await fetch(
      "http://localhost:5000/api/maintenance/trainer",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Test với tham số query
        // URL có thể là: ?dateFrom=2025-10-01&dateTo=2025-10-31
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ API hoạt động thành công!");
      console.log("📊 Dữ liệu trả về:", data);
      console.log(`📋 Số lượng lịch bảo trì: ${data.data.length}`);

      if (data.data.length > 0) {
        console.log("🔧 Lịch bảo trì đầu tiên:", {
          title: data.data[0].title,
          type: data.data[0].maintenanceType,
          priority: data.data[0].priority,
          date: data.data[0].scheduledDate,
          room: data.data[0].room?.roomName,
        });
      }
    } else {
      console.error("❌ API lỗi:", data);
    }
  } catch (error) {
    console.error("🚨 Lỗi kết nối:", error);
  }
};

// Hướng dẫn sử dụng:
console.log(`
🧪 HƯỚNG DẪN TEST API MAINTENANCE

1. Chạy backend server:
   cd backend && npm start

2. Tạo dữ liệu mẫu:
   cd backend && node scripts/createSampleMaintenanceSchedules.js

3. Lấy token đăng nhập:
   - Đăng nhập vào ứng dụng
   - Mở Developer Tools > Application > Local Storage
   - Copy token từ localStorage

4. Thay token vào biến ở trên và chạy test:
   node backend/test-maintenance-api.js

5. Kiểm tra frontend:
   - Đăng nhập với tài khoản trainer
   - Vào trang Lịch Dạy
   - Click nút "Bảo trì" để toggle hiển thị
   - Xem các card bảo trì hiển thị bên cạnh lịch dạy

📋 CHECKLIST:
□ Backend server chạy (http://localhost:5000)
□ Database có dữ liệu rooms và users
□ Đã tạo dữ liệu mẫu maintenance schedules  
□ Frontend chạy (http://localhost:3000)
□ Token authentication hợp lệ
□ Component MaintenanceScheduleCard hiển thị đúng
□ Toggle button hoạt động
□ Dữ liệu cập nhật khi đổi tuần
□ Thống kê hiển thị đúng số lượng
`);

// Uncomment dòng dưới để chạy test (sau khi thay token)
// testMaintenanceAPI();
