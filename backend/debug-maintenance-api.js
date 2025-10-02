// Test script để kiểm tra lỗi tạo maintenance từ issue report
// Chạy script này để debug

const testCreateMaintenanceFromReport = async () => {
  try {
    // Thay token và reportId thực tế
    const token = "YOUR_TOKEN_HERE";
    const reportId = "YOUR_REPORT_ID_HERE";

    const testData = {
      title: "Test Maintenance",
      description: "Test maintenance description",
      scheduledDate: "2025-10-05T09:00:00.000Z",
      estimatedDuration: 2,
      maintenanceType: "repair",
      priority: "medium",
      estimatedCost: 500000,
      technician: {
        name: "Test Technician",
        phone: "0901234567",
        email: "test@email.com",
        company: "Test Company",
      },
    };

    console.log("Test data:", testData);

    const response = await fetch(
      `http://localhost:5000/api/issue-reports/${reportId}/create-maintenance`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const responseData = await response.json();

    if (response.ok) {
      console.log("✅ API thành công!");
      console.log("📊 Response:", responseData);
    } else {
      console.error("❌ API lỗi:", responseData);
      console.log("🔍 Status:", response.status);
    }
  } catch (error) {
    console.error("🚨 Network error:", error);
  }
};

console.log(`
🧪 HƯỚNG DẪN DEBUG MAINTENANCE API

1. Tạo issue report trước:
   - Vào Admin > Asset Management 
   - Tạo issue report mới hoặc dùng report có sẵn

2. Lấy token và reportId:
   - Token: DevTools > Application > Local Storage > token
   - Report ID: Từ URL hoặc inspect element

3. Cập nhật token và reportId ở trên

4. Chạy test:
   node backend/debug-maintenance-api.js

5. Kiểm tra console logs của backend server

❗ CHECKLIST DEBUG:
□ Backend server đang chạy
□ Database connection OK
□ User có quyền admin
□ Issue report tồn tại và valid
□ Scheduled date format đúng
□ estimatedDuration là số > 0
□ estimatedCost là số >= 0
□ MaintenanceSchedule model schema đúng
`);

// Uncomment để chạy test
// testCreateMaintenanceFromReport();
