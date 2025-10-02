# Tính năng Lịch Bảo Trì cho Trainer

## Tổng quan

Tính năng này cho phép trainer xem lịch bảo trì thiết bị và phòng tập bên cạnh lịch dạy của họ, giúp họ có thể chuẩn bị và điều chỉnh lịch dạy phù hợp.

## Tính năng chính

### 1. Hiển thị Lịch Bảo Trì

- **Vị trí**: Hiển thị trực tiếp trong trang TrainerSchedule bên cạnh lịch dạy
- **Thông tin hiển thị**:
  - Tiêu đề và mô tả công việc bảo trì
  - Loại bảo trì (định kỳ, sửa chữa, thay thế, kiểm tra, khẩn cấp, phòng ngừa)
  - Thời gian bắt đầu và thời lượng dự kiến
  - Mức độ ưu tiên (thấp, trung bình, cao, khẩn cấp)
  - Phòng/thiết bị được bảo trì
  - Cảnh báo nếu có thể ảnh hưởng đến lịch dạy

### 2. Tùy chọn Hiển thị

- **Toggle Button**: Cho phép trainer bật/tắt hiển thị lịch bảo trì
- **Biểu tượng**: Hiển thị số lượng lịch bảo trì trong tuần hiện tại
- **Màu sắc**: Phân biệt theo mức độ ưu tiên

### 3. Cảnh báo Thông minh

- Tự động cảnh báo khi lịch bảo trì có thể ảnh hưởng đến lịch dạy
- Hiển thị thông báo đặc biệt cho các công việc ưu tiên cao hoặc khẩn cấp

### 4. Thống kê Bảo trì

- Hiển thị số lượng lịch bảo trì trong tuần
- Đếm số lịch bảo trì ưu tiên cao
- Tích hợp vào dashboard thống kê tổng quan

## API Endpoints

### Lấy lịch bảo trì cho trainer

```
GET /api/maintenance/trainer
```

**Query Parameters:**

- `dateFrom`: Ngày bắt đầu (ISO string)
- `dateTo`: Ngày kết thúc (ISO string)
- `roomId`: ID phòng cụ thể (optional)
- `status`: Trạng thái lịch bảo trì (mặc định: "scheduled,in_progress")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "maintenance_id",
      "title": "Bảo trì định kỳ hệ thống điều hòa",
      "description": "Kiểm tra và bảo trì hệ thống điều hòa không khí",
      "maintenanceType": "routine",
      "priority": "medium",
      "status": "scheduled",
      "scheduledDate": "2025-10-05T09:00:00.000Z",
      "estimatedDuration": 2,
      "targetType": "room",
      "room": {
        "_id": "room_id",
        "roomName": "Phòng tập 1",
        "roomCode": "PT001"
      },
      "equipment": null
    }
  ],
  "message": "Lấy lịch bảo trì thành công"
}
```

## Components

### MaintenanceScheduleCard

Component hiển thị thông tin chi tiết của một lịch bảo trì:

**Props:**

- `maintenance`: Object chứa thông tin lịch bảo trì

**Features:**

- Hiển thị icon và màu sắc theo loại bảo trì
- Badge ưu tiên có màu phù hợp
- Thông tin thời gian và địa điểm
- Cảnh báo tác động đến lịch dạy
- Responsive design

### TrainerSchedule (Updated)

Component chính đã được cập nhật để tích hợp lịch bảo trì:

**New States:**

- `maintenanceSchedules`: Danh sách lịch bảo trì
- `showMaintenance`: Toggle hiển thị lịch bảo trì
- `maintenanceLoading`: Trạng thái loading

**New Functions:**

- `fetchMaintenanceSchedules()`: Lấy dữ liệu lịch bảo trì
- `getMaintenanceForDay(dayOfWeek)`: Lấy lịch bảo trì theo ngày

## Cài đặt và Chạy

### 1. Tạo dữ liệu mẫu

```bash
cd backend
node scripts/createSampleMaintenanceSchedules.js
```

### 2. Khởi động server

```bash
cd backend
npm start
```

### 3. Khởi động frontend

```bash
cd ../
npm run dev
```

## Cách sử dụng

### Cho Trainer:

1. Đăng nhập với tài khoản trainer
2. Vào trang "Lịch Dạy" (TrainerSchedule)
3. Sử dụng nút "Bảo trì" để bật/tắt hiển thị lịch bảo trì
4. Xem lịch bảo trì được hiển thị bên cạnh lịch dạy theo từng ngày
5. Chú ý các cảnh báo màu đỏ/cam cho lịch bảo trì có thể ảnh hưởng đến lịch dạy

### Cho Admin:

- Tiếp tục sử dụng các tính năng quản lý lịch bảo trì như trước
- Dữ liệu bảo trì sẽ tự động hiển thị cho trainer

## Lưu ý kỹ thuật

### Frontend:

- Component MaintenanceScheduleCard sử dụng Lucide icons
- Responsive design cho mobile và desktop
- Sử dụng Tailwind CSS cho styling
- Tự động fetch dữ liệu khi thay đổi tuần

### Backend:

- Endpoint `/api/maintenance/trainer` chỉ cho phép xem, không chỉnh sửa
- Tự động lọc lịch bảo trì theo thời gian
- Giới hạn 50 records để tránh quá tải
- Populate thông tin phòng và thiết bị

### Security:

- Yêu cầu authentication token
- Trainer chỉ có quyền xem, không thể chỉnh sửa lịch bảo trì
- Dữ liệu được filter theo thời gian để tránh lộ thông tin không cần thiết

## Troubleshooting

### Không hiển thị lịch bảo trì:

1. Kiểm tra kết nối API: `/api/maintenance/trainer`
2. Đảm bảo có dữ liệu mẫu trong database
3. Kiểm tra token authentication
4. Xem console log để debug

### Lỗi 404 API:

1. Kiểm tra server backend đã chạy
2. Đảm bảo route được khai báo trong server.js
3. Kiểm tra import controller trong maintenanceRoutes.js

### Không hiển thị đúng thời gian:

1. Kiểm tra timezone setting
2. Đảm bảo dữ liệu scheduledDate đúng format
3. Xem function getWeekDates() và getMaintenanceForDay()
