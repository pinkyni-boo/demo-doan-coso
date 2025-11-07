# Tự động cập nhật lịch điểm danh khi thay đổi thời gian lớp học

## Vấn đề

Trước đây, khi Admin sửa thời gian lớp học (startDate, endDate, schedule), các buổi điểm danh đã tạo không được cập nhật theo. Điều này gây ra tình trạng:

- Lịch điểm danh không đồng bộ với lịch học thực tế
- Trainer không lấy được đúng và đủ thời gian học của lớp
- Phải tạo lại thủ công các buổi điểm danh

## Giải pháp

Đã implement hệ thống tự động:

### 1. **Tính toán lịch học tự động**

Function `calculateSessionDates()` tính toán tất cả các ngày học dựa trên:

- `startDate`: Ngày bắt đầu lớp
- `endDate`: Ngày kết thúc lớp
- `schedule`: Lịch học trong tuần (thứ, giờ bắt đầu, giờ kết thúc)
- `totalSessions`: Tổng số buổi học

### 2. **Auto-update Attendance Records**

Khi Admin cập nhật lớp học (`PUT /api/classes/:id`), hệ thống tự động:

✅ **Phát hiện thay đổi:**

- Thay đổi schedule (ngày học, giờ học)
- Thay đổi startDate hoặc endDate
- Thay đổi totalSessions

✅ **Xử lý thông minh:**

- **Cập nhật ngày** cho các buổi chưa điểm danh
- **Giữ nguyên** các buổi đã điểm danh (isPresent = true)
- **Tạo mới** các buổi học mới nếu tăng totalSessions
- **Xóa** các buổi dư thừa nếu giảm totalSessions (chỉ xóa chưa điểm danh)

✅ **Bulk operations** để tối ưu performance

### 3. **API mới cho Trainer**

Endpoint: `GET /api/trainers/class/:classId/full-schedule`

Trainer có thể xem đầy đủ lịch học với thông tin:

```json
{
  "success": true,
  "classInfo": {
    "_id": "...",
    "className": "Yoga Cơ Bản",
    "totalSessions": 12,
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "schedule": [
      {
        "dayOfWeek": 2,
        "startTime": "18:00",
        "endTime": "19:30"
      }
    ]
  },
  "fullSchedule": [
    {
      "sessionNumber": 1,
      "scheduledDate": "2025-01-07",
      "dayOfWeek": 2,
      "startTime": "18:00",
      "endTime": "19:30",
      "hasAttendanceRecord": true,
      "totalStudents": 15,
      "presentCount": 12,
      "absentCount": 3,
      "attendanceRate": 80,
      "status": "completed"
    },
    {
      "sessionNumber": 2,
      "scheduledDate": "2025-01-14",
      "dayOfWeek": 2,
      "startTime": "18:00",
      "endTime": "19:30",
      "hasAttendanceRecord": true,
      "totalStudents": 15,
      "presentCount": 0,
      "absentCount": 0,
      "attendanceRate": 0,
      "status": "pending"
    }
  ],
  "summary": {
    "totalSessions": 12,
    "sessionsCreated": 2,
    "sessionsNotCreated": 10
  }
}
```

## Luồng hoạt động

### Khi Admin update lớp học:

```
1. Admin gửi PUT /api/classes/:id với data mới
   ↓
2. Hệ thống lấy thông tin lớp học cũ
   ↓
3. Cập nhật thông tin lớp học mới
   ↓
4. So sánh thay đổi (schedule, date, totalSessions)
   ↓
5. Nếu có thay đổi → Gọi updateAttendanceRecords()
   ├─ Tính toán lại tất cả ngày học
   ├─ Lấy danh sách học viên đã thanh toán
   ├─ Lấy attendance records hiện có
   ├─ Update hoặc Insert attendance records
   └─ Xóa các session dư thừa (nếu có)
   ↓
6. Trả về kết quả cho Admin
```

### Khi Trainer xem lịch:

```
1. Trainer gọi GET /api/trainers/class/:classId/full-schedule
   ↓
2. Hệ thống tính toán tất cả ngày học từ schedule
   ↓
3. Lấy attendance records đã tạo
   ↓
4. Merge data và trả về lịch đầy đủ
   ├─ Các buổi đã tạo attendance: hiển thị thống kê
   ├─ Các buổi chưa tạo: status = "not_created"
   └─ Tổng kết: totalSessions, sessionsCreated, sessionsNotCreated
```

## Files đã thay đổi

### Backend Controllers

1. **`backend/controllers/classController.js`**

   - Thêm `calculateSessionDates()` - Tính toán ngày học
   - Thêm `updateAttendanceRecords()` - Cập nhật attendance records
   - Sửa `updateClass()` - Tích hợp auto-update
   - Import `Attendance` model

2. **`backend/controllers/trainerController.js`**
   - Thêm `getClassFullSchedule()` - API xem lịch đầy đủ
   - Thêm `calculateSessionDates()` - Helper function
   - Import `Attendance` model

### Backend Routes

3. **`backend/routes/trainerRoutes.js`**
   - Thêm route: `GET /class/:classId/full-schedule`
   - Export `getClassFullSchedule` controller

## Testing

### Test 1: Cập nhật schedule

```bash
# Trước: Lớp học Thứ 2, Thứ 4 (18:00-19:30)
# Sau: Lớp học Thứ 3, Thứ 5 (19:00-20:30)

PUT http://localhost:5000/api/classes/[classId]
Content-Type: application/json
Authorization: Bearer [admin-token]

{
  "schedule": [
    { "dayOfWeek": 2, "startTime": "19:00", "endTime": "20:30" },
    { "dayOfWeek": 4, "startTime": "19:00", "endTime": "20:30" }
  ]
}

# Kết quả: Tất cả attendance records chưa điểm danh được cập nhật ngày mới
```

### Test 2: Thay đổi ngày khai giảng

```bash
# Trước: startDate = 2025-01-01
# Sau: startDate = 2025-01-15

PUT http://localhost:5000/api/classes/[classId]
Content-Type: application/json
Authorization: Bearer [admin-token]

{
  "startDate": "2025-01-15"
}

# Kết quả: Attendance records được tính lại từ ngày 15/01
```

### Test 3: Tăng/giảm tổng số buổi

```bash
# Trước: totalSessions = 12
# Sau: totalSessions = 15

PUT http://localhost:5000/api/classes/[classId]
Content-Type: application/json
Authorization: Bearer [admin-token]

{
  "totalSessions": 15
}

# Kết quả:
# - Tạo thêm 3 buổi mới (session 13, 14, 15)
# - Các buổi cũ giữ nguyên

# Sau: totalSessions = 10
{
  "totalSessions": 10
}

# Kết quả:
# - Xóa buổi 11, 12 (nếu chưa điểm danh)
# - Giữ buổi 11, 12 nếu đã điểm danh
```

### Test 4: Xem lịch đầy đủ (Trainer)

```bash
GET http://localhost:5000/api/trainers/class/[classId]/full-schedule
Authorization: Bearer [trainer-token]

# Kết quả: Danh sách đầy đủ 12 buổi học với:
# - Ngày học đã tính toán
# - Trạng thái điểm danh
# - Thống kê có mặt/vắng mặt
```

## Lưu ý quan trọng

⚠️ **Bảo vệ dữ liệu đã điểm danh:**

- Các buổi đã điểm danh (`isPresent = true`) KHÔNG bị thay đổi ngày
- Chỉ cập nhật các buổi chưa điểm danh (`isPresent = false`)

⚠️ **Performance:**

- Sử dụng `bulkWrite()` để xử lý hàng loạt records
- Chỉ process khi có thay đổi thực sự
- Log chi tiết để debug

⚠️ **Error handling:**

- Lỗi update attendance KHÔNG làm fail việc update class
- Log error nhưng vẫn trả về success cho Admin
- Trainer vẫn có thể tạo session thủ công nếu cần

## Lợi ích

✅ Tự động đồng bộ lịch học và lịch điểm danh
✅ Trainer luôn thấy đúng thời gian học
✅ Giảm công việc thủ công
✅ Tăng tính chính xác
✅ Dễ dàng thay đổi lịch học
✅ Không mất dữ liệu đã điểm danh

## API Reference

### 1. Update Class (Admin)

- **Endpoint:** `PUT /api/classes/:id`
- **Auth:** Admin token
- **Body:** Class update data
- **Side effect:** Auto-update attendance records

### 2. Get Full Schedule (Trainer)

- **Endpoint:** `GET /api/trainers/class/:classId/full-schedule`
- **Auth:** Trainer token
- **Response:** Full schedule with calculated dates and attendance status
- **Use case:** Hiển thị lịch học đầy đủ cho trainer

---

**Ngày tạo:** 30/10/2025
**Version:** 1.0.0
**Tác giả:** GitHub Copilot
