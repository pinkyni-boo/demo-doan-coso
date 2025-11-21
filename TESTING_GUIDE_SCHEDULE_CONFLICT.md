# Quick Testing Guide - Trainer Schedule Conflict Feature

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
node server.js
```

Expected output: `Server running on port 3000`

### 2. Run Automated Tests

```bash
cd backend
node test-trainer-schedule-conflict.js
```

### 3. Manual Testing in Browser

#### Step 1: Login as Admin

- URL: http://localhost:5173
- Username: `admin`
- Password: `admin123`

#### Step 2: Navigate to Class Management

- Click "Quản lý lớp học" in sidebar

#### Step 3: Create New Class

- Click "Thêm lớp học mới" button

#### Step 4: Fill Form

1. **Tên lớp**: "Test Conflict Class"
2. **Dịch vụ**: Select any service
3. **Huấn luyện viên**: Select a trainer who has existing classes
4. **Ngày bắt đầu**: 2024-12-20
5. **Ngày kết thúc**: 2025-03-20
6. **Lịch dạy**: Click "Thêm lịch dạy"
   - Thứ: Thứ 2
   - Giờ bắt đầu: 14:00
   - Giờ kết thúc: 15:00

#### Step 5: Observe Behavior

**Expected Results:**

✅ **Case 1: No Conflict**

- Loading indicator appears for ~1 second
- Green checkmark: "✓ Lịch dạy hợp lệ - không có trung lịch"
- Submit button works normally

❌ **Case 2: Has Conflict**

- Loading indicator appears for ~1 second
- Red warning box appears:
  ```
  ⚠️ Trùng lịch dạy!
  Lớp 'Yoga Buổi Sáng' - Thứ 2 (14:00 - 15:00) trùng với lịch mới (14:45 - 15:30)
  Vui lòng chọn thời gian khác hoặc chọn HLV khác.
  ```
- Clicking "Lưu thay đổi" shows alert
- Form submission is blocked

---

## 🧪 Test Scenarios

### Scenario 1: Overlapping Schedule

**Setup:**

- Trainer has existing class: Thứ 2, 14:00 - 15:00
- Create new class: Thứ 2, 14:45 - 15:30

**Expected:** ❌ Conflict detected (15-minute overlap)

### Scenario 2: Exact Same Time

**Setup:**

- Trainer has existing class: Thứ 4, 18:00 - 19:30
- Create new class: Thứ 4, 18:00 - 19:30

**Expected:** ❌ Conflict detected (complete overlap)

### Scenario 3: Different Day

**Setup:**

- Trainer has existing class: Thứ 2, 14:00 - 15:00
- Create new class: Thứ 3, 14:00 - 15:00

**Expected:** ✅ No conflict (different days)

### Scenario 4: Adjacent Times

**Setup:**

- Trainer has existing class: Thứ 2, 14:00 - 15:00
- Create new class: Thứ 2, 15:00 - 16:00

**Expected:** ✅ No conflict (back-to-back, no overlap)

### Scenario 5: Before Existing Class

**Setup:**

- Trainer has existing class: Thứ 2, 14:00 - 15:00
- Create new class: Thứ 2, 12:00 - 13:00

**Expected:** ✅ No conflict (different time slots)

### Scenario 6: Multiple Schedule Entries

**Setup:**

- Trainer has existing class: Thứ 2, 14:00 - 15:00 + Thứ 4, 18:00 - 19:00
- Create new class: Thứ 2, 14:30 - 15:30 + Thứ 3, 10:00 - 11:00

**Expected:** ❌ Conflict on Thứ 2, but Thứ 3 is OK

### Scenario 7: Edit Existing Class (No Change)

**Setup:**

- Edit existing class without changing trainer or schedule

**Expected:** ✅ No conflict (excludes itself)

---

## 📊 API Testing with cURL

### Check No Conflict:

```bash
curl -X GET "http://localhost:3000/api/trainers/check-schedule-conflict?trainerId=675e7d41b6cfae1a5ff0a1d3&schedule=%5B%7B%22dayOfWeek%22%3A%22Th%E1%BB%A9%202%22%2C%22startTime%22%3A%2206%3A00%22%2C%22endTime%22%3A%2207%3A30%22%7D%5D&startDate=2024-12-20&endDate=2025-03-20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check With Conflict:

```bash
curl -X GET "http://localhost:3000/api/trainers/check-schedule-conflict?trainerId=675e7d41b6cfae1a5ff0a1d3&schedule=%5B%7B%22dayOfWeek%22%3A%22Th%E1%BB%A9%202%22%2C%22startTime%22%3A%2214%3A00%22%2C%22endTime%22%3A%2215%3A00%22%7D%5D&startDate=2024-12-20&endDate=2025-03-20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Note:** Replace `YOUR_TOKEN_HERE` with actual JWT token from login response.

---

## 🔍 Debugging Tips

### Frontend Console (F12):

```javascript
// Check current conflict state
console.log("Conflict:", scheduleConflict);

// Check if checking is in progress
console.log("Checking:", checkingSchedule);

// Check form data
console.log("Form Data:", formData);
```

### Backend Logs:

Look for these console.log messages in terminal:

```
Checking schedule conflict for trainer: 675e7d41b6cfae1a5ff0a1d3
Found 3 existing classes for trainer
Checking schedule entry: Thứ 2, 14:00 - 15:00
Conflict found: Class A overlaps with Class B
```

### Network Tab (F12):

- Check request URL and parameters
- Verify Authorization header is present
- Check response status code (200 = success)
- Inspect response JSON

---

## ✅ Success Criteria

**Feature is working correctly if:**

1. ✅ Loading indicator shows when checking
2. ✅ Green checkmark appears for valid schedules
3. ✅ Red warning appears for conflicting schedules
4. ✅ Submit button is blocked when conflict exists
5. ✅ Alert shows detailed conflict information
6. ✅ Auto-check triggers on form field changes
7. ✅ Debounce prevents excessive API calls
8. ✅ Backend returns accurate conflict detection

---

## 🐛 Common Issues

### Issue 1: "Cannot read properties of null"

**Solution:** Make sure backend server is running on port 3000

### Issue 2: "Unauthorized" error

**Solution:** Login again to refresh JWT token

### Issue 3: Conflict detection not triggering

**Solution:** Check these fields are filled:

- Huấn luyện viên (trainer selected)
- Ngày bắt đầu (start date)
- Ngày kết thúc (end date)
- Lịch dạy (at least one schedule entry)

### Issue 4: Always shows "Lịch dạy hợp lệ"

**Solution:** Make sure trainer has existing classes in database

### Issue 5: Debounce too slow

**Solution:** Adjust timeout in ClassManagement.jsx (currently 800ms)

---

## 📸 Screenshots

### No Conflict:

```
┌────────────────────────────────────┐
│ Huấn luyện viên: Nguyễn Văn A     │
│ [Dropdown]                         │
│                                    │
│ ✓ Lịch dạy hợp lệ - không có      │
│   trung lịch                       │
└────────────────────────────────────┘
```

### Has Conflict:

```
┌────────────────────────────────────┐
│ Huấn luyện viên: Nguyễn Văn A     │
│ [Dropdown]                         │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⚠️ Trùng lịch dạy!             │ │
│ │ Lớp 'Yoga' - Thứ 2 (14:00)    │ │
│ │ trùng với lịch mới (14:45)     │ │
│ │                                │ │
│ │ Vui lòng chọn thời gian khác   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Loading:

```
┌────────────────────────────────────┐
│ Huấn luyện viên: Nguyễn Văn A     │
│ [Dropdown]                         │
│                                    │
│ 🔄 Đang kiểm tra lịch dạy...      │
└────────────────────────────────────┘
```

---

**Ready to test!** 🚀
