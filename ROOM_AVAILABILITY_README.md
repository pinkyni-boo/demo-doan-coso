# Cải tiến phần chọn phòng khi thêm lịch dạy bù

## Vấn đề đã giải quyết

**Vấn đề cũ**: Khi admin thêm lịch dạy bù, phần chọn phòng chỉ là input text tự do, dẫn đến:

- Có thể chọn phòng đã có người sử dụng
- Không kiểm tra xung đột thời gian
- Dễ nhầm lẫn tên phòng
- Không hiển thị thông tin chi tiết về phòng

**Giải pháp mới**:

- ✅ Dropdown chọn phòng từ danh sách có sẵn
- ✅ Kiểm tra tự động phòng trống theo thời gian
- ✅ Hiển thị xung đột nếu có
- ✅ Real-time validation

## Tính năng mới

### 1. API kiểm tra phòng trống

**Endpoint**: `GET /api/rooms/available/check`
**Params**:

- `date`: Ngày cần kiểm tra (YYYY-MM-DD)
- `startTime`: Giờ bắt đầu (HH:MM)
- `endTime`: Giờ kết thúc (HH:MM)

**Response**:

```json
{
  "success": true,
  "message": "Tìm thấy 3 phòng trống",
  "data": {
    "availableRooms": [
      {
        "_id": "room_id",
        "roomName": "Phòng Cardio 1",
        "roomCode": "CARD-01",
        "location": "Tầng 1, Khu A",
        "capacity": 25,
        "facilities": ["Điều hòa", "Gương", "Âm thanh"]
      }
    ],
    "conflictRooms": [
      {
        "_id": "room_id",
        "roomName": "Phòng Tập Tạ",
        "conflicts": [
          {
            "type": "class",
            "name": "Lớp Yoga Cơ Bản",
            "time": "19:00-21:00",
            "instructor": "HLV Nguyễn Văn A"
          }
        ]
      }
    ],
    "searchParams": {
      "date": "2025-10-15",
      "startTime": "19:00",
      "endTime": "21:00",
      "dayOfWeek": "T3"
    }
  }
}
```

### 2. Logic kiểm tra xung đột

#### Kiểm tra với lớp học thường

- Parse schedule string (format: "T2,T4 - 19:00-21:00")
- Map ngày trong tuần với tên tiếng Việt
- So sánh khung thời gian overlap

#### Kiểm tra với lịch dạy bù khác

- Tìm tất cả lịch bù đã approved trong ngày đó
- Kiểm tra xung đột thời gian trong cùng phòng

#### Time conflict detection

```javascript
const isTimeConflict = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};
```

### 3. Giao diện cải tiến

#### Auto-refresh room list

- Debounce 500ms khi thay đổi ngày/giờ
- Loading indicator khi đang kiểm tra
- Error handling rõ ràng

#### Smart dropdown

- Chỉ hiển thị phòng trống
- Thông tin chi tiết: tên, vị trí, sức chứa
- Disable submit nếu không có phòng trống

#### Visual feedback

```jsx
// Loading state
<div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
  <p className="text-sm text-blue-800">🔍 Đang kiểm tra phòng trống...</p>
</div>

// Error state
<div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-sm text-red-800">❌ Không có phòng trống trong khung thời gian này</p>
</div>

// Success state
<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
  <p className="text-sm text-green-800">✅ Tìm thấy 3 phòng trống</p>
</div>
```

## Implementation Details

### 1. Backend Changes

#### Room Controller

- Thêm `getAvailableRooms()` function
- Chuyển từ CommonJS sang ES6 modules
- Logic phức tạp để parse schedule và detect conflicts

#### Room Routes

- Thêm route `GET /rooms/available/check`
- Require admin authentication
- Import function từ controller

### 2. Frontend Changes

#### AdminScheduleRequests Component

- Thêm state cho `availableRooms`, `loadingRooms`, `roomCheckError`
- useEffect để auto-check khi thay đổi params
- Debounce để tối ưu performance
- Validation mạnh mẽ hơn

#### UI Improvements

- Modal rộng hơn để chứa thêm thông tin
- Dropdown thay vì text input
- Real-time feedback
- Disable submit khi không hợp lệ

## Workflow mới

### 1. Admin thêm lịch dạy bù

```
1. Chọn ngày dạy bù
2. Chọn giờ bắt đầu/kết thúc
3. System tự động kiểm tra phòng trống
4. Hiển thị dropdown chỉ có phòng available
5. Admin chọn phòng từ list
6. Submit được enable chỉ khi có phòng trống
```

### 2. Validation Rules

- Ngày phải trong khoảng thời gian lớp học
- Giờ bắt đầu < giờ kết thúc
- Phải có ít nhất 1 phòng trống
- Phòng đã chọn phải trong list available

### 3. Error Handling

- API timeout → hiển thị lỗi, cho phép retry
- Không có phòng trống → hiển thị message, disable submit
- Phòng bị conflict → tự động remove khỏi dropdown

## Testing

### 1. API Testing

```bash
cd backend
node test-room-availability.js
```

### 2. Manual Testing

1. Login as admin
2. Go to Schedule Requests
3. Find approved request
4. Click "Thêm lịch dạy bù"
5. Test different time slots
6. Verify room conflicts detection

### 3. Browser Console Test

```javascript
const token = localStorage.getItem("token");
fetch(
  "http://localhost:5000/api/rooms/available/check?date=2025-10-15&startTime=19:00&endTime=21:00",
  {
    headers: { Authorization: "Bearer " + token },
  }
)
  .then((r) => r.json())
  .then((data) => console.log("Room availability:", data));
```

## Benefits

### 1. User Experience

- ✅ Không còn chọn nhầm phòng đã có người
- ✅ Interface trực quan, dễ sử dụng
- ✅ Real-time feedback
- ✅ Thông tin chi tiết về phòng

### 2. Data Integrity

- ✅ Đảm bảo không có conflict về phòng
- ✅ Validation chặt chẽ
- ✅ Consistent room naming

### 3. System Reliability

- ✅ Proper error handling
- ✅ Performance optimized với debounce
- ✅ Secure với admin-only access

## Future Enhancements

### 1. Advanced Features

- Hiển thị schedule hiện tại của phòng
- Suggest alternative time slots
- Room booking calendar view
- Conflict resolution suggestions

### 2. Performance

- Cache room availability data
- Optimize database queries
- Add indexes for faster lookups

### 3. User Experience

- Drag & drop time selection
- Visual room layout
- Equipment requirements matching
- Automated scheduling suggestions

## Migration Notes

### Backward Compatibility

- Existing makeup schedules không bị ảnh hưởng
- API cũ vẫn hoạt động bình thường
- Progressive enhancement approach

### Database Migration

- Không cần migrate data
- Chỉ cần đảm bảo Room collection có đủ data
- Verify schedule format consistency

## Monitoring

### Key Metrics

- Room availability check frequency
- Conflict detection accuracy
- User adoption rate
- Error rates

### Logging

- All room availability checks
- Conflict detection results
- User actions and selections
- Performance metrics
