# BÁO CÁO ĐỒ ÁN: HỆ THỐNG QUẢN LÝ PHÒNG TẬP THÔNG MINH

---

**Về chức năng:**

- ✅ Quản lý người dùng với 3 vai trò: Admin, Trainer, User
- ✅ Quản lý lớp học, lịch dạy, điểm danh
- ✅ Quản lý thẻ thành viên và thanh toán
- ✅ Hệ thống thông báo tự động
- ✅ Xử lý xung đột lịch dạy và phòng học
- ✅ Quản lý lịch bảo trì thiết bị

**Về kỹ thuật:**

- ✅ Áp dụng kiến trúc MVC
- ✅ RESTful API design
- ✅ Authentication & Authorization với JWT
- ✅ Responsive design (mobile-friendly)
- ✅ Database optimization với indexing
- ✅ Error handling và validation đầy đủ

#### Dành cho Admin:

- Quản lý người dùng (CRUD)
- Quản lý lớp học với kiểm tra xung đột lịch
- Duyệt/từ chối yêu cầu thay đổi lịch
- Thêm lịch dạy bù với kiểm tra phòng trống
- Xử lý thanh toán (approve/reject)
- Gia hạn thẻ thành viên
- Dashboard thống kê

#### Dành cho Trainer:

- Xem lịch dạy đầy đủ
- Điểm danh học viên
- Thêm nội dung buổi học
- Gửi yêu cầu thay đổi lịch
- Xem lịch bảo trì thiết bị

#### Dành cho User:

- Đăng ký/đăng nhập
- Xem và đăng ký lớp học
- Đăng ký thẻ thành viên
- Upload proof of payment
- Xem thông báo
- Gửi feedback và báo cáo sự cố

### 3.2. Phạm vi không thực hiện

- Thanh toán online tự động (gateway integration)
- Mobile app riêng
- Video streaming cho lớp online
- AI recommendation system
- Multi-language support

---

## 4. CÔNG NGHỆ VÀ CÔNG CỤ SỬ DỤNG

### 4.1. Backend Technologies

#### **Node.js + Express.js**

- **Lý do chọn:**

  - Non-blocking I/O, hiệu năng cao
  - JavaScript full-stack (đồng nhất với frontend)
  - Ecosystem phong phú (npm packages)
  - Dễ triển khai và scale

- **Vai trò:**
  - Xây dựng RESTful API
  - Xử lý business logic
  - Middleware cho authentication/authorization

#### **MongoDB + Mongoose**

- **Lý do chọn:**

  - NoSQL database linh hoạt
  - Document-based phù hợp với cấu trúc phức tạp
  - Schema validation với Mongoose
  - Dễ scale horizontal

- **Vai trò:**
  - Lưu trữ dữ liệu người dùng, lớp học, thanh toán...
  - Query optimization với indexing
  - Data validation và relationship management

#### **JWT (JSON Web Token)**

- **Vai trò:**
  - Stateless authentication
  - Role-based access control
  - Secure token-based session management

#### **Cloudinary**

- **Vai trò:**
  - Cloud-based image storage
  - Tối ưu hình ảnh tự động
  - CDN delivery

### 4.2. Frontend Technologies

#### **React.js**

- **Lý do chọn:**

  - Component-based architecture
  - Virtual DOM cho performance
  - Rich ecosystem (hooks, router...)
  - Reusable components

- **Vai trò:**
  - Xây dựng user interface
  - State management với useState, useEffect
  - Client-side routing

#### **Vite**

- **Vai trò:**
  - Fast development server
  - Hot Module Replacement (HMR)
  - Optimized production build

#### **TailwindCSS**

- **Lý do chọn:**

  - Utility-first CSS framework
  - Responsive design dễ dàng
  - Customizable và consistent
  - Giảm file size với purging

- **Vai trò:**
  - Styling components
  - Responsive layout
  - UI consistency

#### **Axios**

- **Vai trò:**
  - HTTP client
  - Request/response interceptors
  - Error handling

### 4.3. Development Tools

#### **Git/GitHub**

- **Vai trò:** Version control system
- Quản lý code, branching, merging
- Collaboration và code review

#### **VS Code**

- **Vai trò:** Code editor chính
- Extensions: ESLint, Prettier, GitLens
- Integrated terminal
- IntelliSense cho JavaScript/React

#### **Postman** (API Testing Tool)

- **Vai trò:** Test và document APIs
- **Sử dụng cho:**
  - Test tất cả API endpoints (GET, POST, PUT, DELETE)
  - Kiểm tra authentication với JWT tokens
  - Validate request/response format
  - Test error handling và edge cases
  - Tạo collections cho từng module (Auth, Classes, Payments...)
  - Environment variables cho dev/prod
- **Ví dụ workflow:**
  ```
  1. Gửi POST /api/auth/login → Lấy token
  2. Set token vào Authorization header
  3. Test các protected endpoints
  4. Verify response status & data
  ```

#### **Thunder Client** (Optional)

- **Vai trò:** Alternative cho Postman, nhẹ hơn
- Test API trực tiếp trong VS Code
- Tích hợp với workspace

#### **MongoDB Compass**

- **Vai trò:** Database GUI tool
- Xem và quản lý collections
- Query builder trực quan
- Monitor performance

#### **Chrome DevTools**

- **Vai trò:** Debug frontend và API calls
- **Network Tab:** Monitor HTTP requests real-time
- **Console:** Debug JavaScript, view errors
- **Application Tab:** Check localStorage (tokens)
- **React DevTools:** Debug React components

#### **Browser Testing Tools**

- Chrome, Firefox, Edge để test responsive
- Mobile simulation trong DevTools
- Cross-browser compatibility check

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1. Tổng quan kiến trúc

Hệ thống áp dụng mô hình **Client-Server Architecture** với **MVC Pattern**.

```
┌─────────────────┐         HTTP/HTTPS          ┌─────────────────┐
│                 │   ←────────────────────→    │                 │
│  CLIENT (React) │                              │  SERVER (Node)  │
│                 │    JSON Request/Response     │                 │
└─────────────────┘                              └─────────────────┘
                                                          │
                                                          │
                                                          ▼
                                                  ┌─────────────────┐
                                                  │  MongoDB Atlas  │
                                                  │   (Database)    │
                                                  └─────────────────┘
```

### 5.2. Backend Architecture (MVC)

```
Request → Routes → Middleware → Controller → Model → Database
                                     ↓
                                  Response
```

**Giải thích từng layer:**

#### **1. Routes Layer**

- Định nghĩa API endpoints
- Map HTTP methods (GET, POST, PUT, DELETE)
- Apply middleware

```javascript
router.post(
  "/schedule-change-requests/:id/makeup-schedule",
  verifyToken,
  verifyAdmin,
  addMakeupSchedule
);
```

#### **2. Middleware Layer**

- **Authentication**: Verify JWT token
- **Authorization**: Check user role
- **Validation**: Validate request data
- **Error Handling**: Catch và xử lý lỗi

```javascript
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};
```

#### **3. Controller Layer**

- Xử lý business logic
- Gọi Model để tương tác database
- Trả về response

```javascript
export const addMakeupSchedule = async (req, res) => {
  try {
    // Validation
    // Business logic
    // Database operation
    // Return response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### **4. Model Layer**

- Định nghĩa schema
- Validation rules
- Relationships
- Query methods

```javascript
const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  trainerId: { type: ObjectId, ref: "User" },
  schedule: [{ dayOfWeek, startTime, endTime }],
});
```

### 5.3. Frontend Architecture

```
App.jsx
  ├── Router
  │     ├── Admin Routes
  │     │     ├── Dashboard
  │     │     ├── UserManagement
  │     │     └── ClassManagement
  │     ├── Trainer Routes
  │     │     ├── Schedule
  │     │     └── Attendance
  │     └── User Routes
  │           ├── Classes
  │           └── Membership
  │
  └── Components
        ├── Common (Navbar, Sidebar, Modal...)
        ├── Admin Components
        ├── Trainer Components
        └── User Components
```

**Component Design Pattern:**

- **Container Components**: Quản lý state, API calls
- **Presentational Components**: Hiển thị UI, nhận props
- **Custom Hooks**: Tái sử dụng logic (useAuth, useFetch...)

### 5.4. Database Architecture

**Document-based với relationships:**

```
Users ←──── Classes ←──── ClassEnrollments ────→ Payments
  │            │
  ↓            ↓
Memberships  Attendances
  │
  ↓
Payments
```

**Optimization strategies:**

- Indexing trên các field thường query (`userId`, `trainerId`, `status`)
- Populate để load related documents
- Pagination cho danh sách lớn
- Aggregation pipeline cho thống kê

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 6.1. Entity Relationship Diagram (ERD)

**Các thực thể chính:**

#### **1. User**

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phone: String,
  role: String (enum: ['admin', 'trainer', 'user']),
  dob: Date,
  gender: String,
  address: String,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date
}
```

#### **2. Class**

```javascript
{
  _id: ObjectId,
  className: String,
  serviceName: String,
  trainerId: ObjectId (ref: User),
  roomId: ObjectId (ref: Room),
  schedule: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String
  }],
  startDate: Date,
  endDate: Date,
  maxStudents: Number,
  currentStudents: Number,
  totalSessions: Number,
  currentSession: Number,
  price: Number,
  status: String (enum: ['pending', 'active', 'completed', 'cancelled']),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **3. ClassEnrollment**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  classId: ObjectId (ref: Class),
  enrollmentDate: Date,
  status: String (enum: ['pending_payment', 'active', 'completed', 'cancelled']),
  paymentStatus: Boolean,
  createdAt: Date
}
```

#### **4. Attendance**

```javascript
{
  _id: ObjectId,
  classId: ObjectId (ref: Class),
  userId: ObjectId (ref: User),
  date: Date,
  sessionNumber: Number,
  isPresent: Boolean,
  checkInTime: Date,
  notes: String,
  markedBy: ObjectId (ref: User),
  createdAt: Date
}
```

#### **5. Membership**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: ['basic', 'standard', 'vip']),
  duration: String (enum: ['monthly', 'quarterly', 'annual']),
  startDate: Date,
  endDate: Date,
  price: Number,
  status: String (enum: ['pending_payment', 'active', 'expired', 'cancelled']),
  paymentStatus: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **6. Payment**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number,
  registrationType: String (enum: ['class', 'membership']),
  registrationId: ObjectId,
  status: String (enum: ['pending', 'approved', 'rejected']),
  proofOfPayment: String (Cloudinary URL),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  rejectedBy: ObjectId (ref: User),
  rejectedAt: Date,
  rejectionReason: String,
  createdAt: Date
}
```

#### **7. ScheduleChangeRequest**

```javascript
{
  _id: ObjectId,
  trainerId: ObjectId (ref: User),
  classId: ObjectId (ref: Class),
  originalDate: Date,
  requestedDate: Date,
  reason: String,
  urgency: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['pending', 'approved', 'rejected']),
  adminResponse: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  makeupSchedule: {
    date: Date,
    startTime: String,
    endTime: String,
    location: String
  },
  createdAt: Date
}
```

#### **8. Notification**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['payment', 'schedule', 'membership', 'system']),
  isRead: Boolean,
  createdAt: Date
}
```

#### **9. Room**

```javascript
{
  _id: ObjectId,
  roomName: String,
  roomCode: String (unique),
  capacity: Number,
  location: String,
  facilities: [String],
  status: String (enum: ['available', 'maintenance', 'unavailable']),
  createdAt: Date
}
```

#### **10. MaintenanceSchedule**

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String (enum: ['routine', 'repair', 'replacement', 'inspection']),
  roomId: ObjectId (ref: Room),
  equipmentId: ObjectId (ref: Equipment),
  scheduledDate: Date,
  duration: Number,
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  status: String (enum: ['scheduled', 'in_progress', 'completed', 'cancelled']),
  assignedTo: String,
  createdAt: Date
}
```

### 6.2. Indexes để tối ưu performance

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, status: 1 });

// Class indexes
classSchema.index({ trainerId: 1 });
classSchema.index({ status: 1 });
classSchema.index({ startDate: 1, endDate: 1 });

// Attendance indexes
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ userId: 1, isPresent: 1 });

// Payment indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ registrationId: 1 });

// ScheduleChangeRequest indexes
scheduleChangeRequestSchema.index({ trainerId: 1, status: 1 });
scheduleChangeRequestSchema.index({ classId: 1 });
```

---

## 7. PHÂN TÍCH VÀ THIẾT KẾ CHỨC NĂNG

### 7.1. Chức năng xác thực và phân quyền

#### **Use Case: Đăng nhập**

**Actor:** User, Trainer, Admin

**Flow:**

1. User nhập username/password
2. Frontend gửi POST `/api/auth/login`
3. Backend verify credentials với bcrypt
4. Tạo JWT token chứa `{id, role}`
5. Trả về token + user info
6. Frontend lưu token vào localStorage
7. Các request sau gửi kèm `Authorization: Bearer <token>`

**Security:**

- Password hashing với bcrypt (salt rounds = 10)
- JWT expiration time
- HttpOnly cookies (optional)

#### **Middleware: verifyToken**

```javascript
const token = req.headers.authorization?.split(" ")[1];
jwt.verify(token, JWT_SECRET, (err, decoded) => {
  req.user = decoded; // {id, role}
  next();
});
```

#### **Middleware: verifyAdmin**

```javascript
if (req.user.role !== "admin") {
  return res.status(403).json({ message: "Forbidden" });
}
next();
```

### 7.2. Chức năng kiểm tra xung đột lịch dạy

#### **Business Logic:**

**Khi tạo/sửa lớp học, cần kiểm tra:**

1. Trainer có lịch trùng không?
2. Phòng có trùng lịch không?

**Algorithm:**

```javascript
// Input: trainerId, schedule, startDate, endDate
// Output: { hasConflict: boolean, conflicts: [] }

function checkScheduleConflict(trainerId, schedule, startDate, endDate) {
  // 1. Lấy tất cả lớp của trainer trong khoảng thời gian
  const trainerClasses = await Class.find({
    trainerId,
    status: { $in: ['active', 'pending'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  // 2. So sánh từng lịch dạy
  for (const newSchedule of schedule) {
    for (const existingClass of trainerClasses) {
      for (const existingSchedule of existingClass.schedule) {
        // Kiểm tra trùng ngày trong tuần
        if (newSchedule.dayOfWeek === existingSchedule.dayOfWeek) {
          // Kiểm tra trùng giờ
          if (timeOverlap(newSchedule, existingSchedule)) {
            conflicts.push({
              class: existingClass,
              schedule: existingSchedule
            });
          }
        }
      }
    }
  }

  return { hasConflict: conflicts.length > 0, conflicts };
}

function timeOverlap(schedule1, schedule2) {
  const start1 = parseTime(schedule1.startTime);
  const end1 = parseTime(schedule1.endTime);
  const start2 = parseTime(schedule2.startTime);
  const end2 = parseTime(schedule2.endTime);

  return (start1 < end2) && (start2 < end1);
}
```

**API Endpoint:**

```
GET /api/trainers/check-schedule-conflict
Query: trainerId, schedule, startDate, endDate, excludeClassId
```

### 7.3. Tự động cập nhật lịch điểm danh

#### **Problem:**

Khi admin sửa `startDate`, `endDate`, hoặc `schedule` của lớp học, các buổi điểm danh cũ không còn đúng.

#### **Solution:**

**Khi update Class:**

```javascript
// 1. Detect schedule changes
const scheduleChanged =
  oldClass.startDate !== newClass.startDate ||
  oldClass.endDate !== newClass.endDate ||
  JSON.stringify(oldClass.schedule) !== JSON.stringify(newClass.schedule);

if (scheduleChanged) {
  // 2. Calculate new session dates
  const newSessionDates = calculateSessionDates(
    newClass.startDate,
    newClass.endDate,
    newClass.schedule,
    newClass.totalSessions
  );

  // 3. Get existing attendances
  const existingAttendances = await Attendance.find({ classId }).sort({
    date: 1,
  });

  // 4. Update strategy
  for (let i = 0; i < newSessionDates.length; i++) {
    const newDate = newSessionDates[i];
    const existingAtt = existingAttendances[i];

    if (existingAtt && existingAtt.isPresent) {
      // Giữ nguyên buổi đã điểm danh
      continue;
    }

    if (existingAtt) {
      // Update ngày cho buổi chưa điểm danh
      await Attendance.updateOne(
        { _id: existingAtt._id },
        { date: newDate, sessionNumber: i + 1 }
      );
    } else {
      // Tạo mới nếu tăng totalSessions
      await createAttendanceForSession(classId, newDate, i + 1);
    }
  }

  // 5. Xóa buổi dư thừa nếu giảm totalSessions
  if (newSessionDates.length < existingAttendances.length) {
    const excessAttendances = existingAttendances
      .slice(newSessionDates.length)
      .filter((att) => !att.isPresent);

    await Attendance.deleteMany({
      _id: { $in: excessAttendances.map((a) => a._id) },
    });
  }
}
```

**Function: calculateSessionDates**

```javascript
function calculateSessionDates(startDate, endDate, schedule, totalSessions) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (dates.length < totalSessions && currentDate <= endDate) {
    const dayOfWeek = getDayOfWeek(currentDate);

    // Kiểm tra có trong schedule không
    const scheduleItem = schedule.find((s) => s.dayOfWeek === dayOfWeek);

    if (scheduleItem) {
      dates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
```

### 7.4. Gia hạn thẻ thành viên thông minh

#### **Business Rules:**

1. **Nếu thẻ đã hết hạn:**

   - `newStartDate = today`
   - `newEndDate = today + duration`

2. **Nếu thẻ còn hạn:**

   - `newStartDate = oldEndDate + 1 day`
   - `newEndDate = newStartDate + duration`

3. **Giá gói gia hạn:**
   - basic-monthly: 500,000đ (30 ngày)
   - standard-monthly: 800,000đ (30 ngày)
   - vip-monthly: 1,200,000đ (30 ngày)
   - ...

#### **Implementation:**

```javascript
export const renewMembership = async (req, res) => {
  const { membershipId, packageType } = req.body;

  // 1. Get membership
  const membership = await Membership.findById(membershipId);

  // 2. Calculate new dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oldEndDate = new Date(membership.endDate);
  oldEndDate.setHours(0, 0, 0, 0);

  let newStartDate, newEndDate;

  if (oldEndDate < today) {
    // Đã hết hạn
    newStartDate = new Date(today);
  } else {
    // Còn hạn
    newStartDate = new Date(oldEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
  }

  // 3. Calculate duration
  const [type, duration] = packageType.split("-");
  const durationDays = {
    monthly: 30,
    quarterly: 90,
    annual: 365,
  }[duration];

  newEndDate = new Date(newStartDate);
  newEndDate.setDate(newEndDate.getDate() + durationDays);

  // 4. Create new membership
  const newMembership = await Membership.create({
    userId: membership.userId,
    type,
    duration,
    startDate: newStartDate,
    endDate: newEndDate,
    price: getPrice(packageType),
    status: "pending_payment",
  });

  // 5. Create payment record
  await Payment.create({
    userId: membership.userId,
    amount: newMembership.price,
    registrationType: "membership",
    registrationId: newMembership._id,
    status: "pending",
  });

  return res.json({ success: true, membership: newMembership });
};
```

### 7.5. Xử lý từ chối thanh toán

#### **Business Logic:**

**Khi admin reject payment:**

1. **Nếu là ClassEnrollment:**

   - Xóa hoàn toàn enrollment
   - User quay về trạng thái chưa đăng ký

2. **Nếu là Membership:**
   - Reset status về `pending_payment`
   - User có thể upload lại proof of payment

#### **Implementation:**

```javascript
export const rejectPayment = async (req, res) => {
  const { paymentId, reason } = req.body;

  // 1. Find payment
  const payment = await Payment.findById(paymentId).populate("userId");

  // 2. Update payment status
  payment.status = "rejected";
  payment.rejectedBy = req.user.id;
  payment.rejectedAt = new Date();
  payment.rejectionReason = reason;
  await payment.save();

  // 3. Handle registration based on type
  if (payment.registrationType === "class") {
    // XÓA enrollment
    await ClassEnrollment.findByIdAndDelete(payment.registrationId);

    // Giảm currentStudents
    await Class.findByIdAndUpdate(enrollment.classId, {
      $inc: { currentStudents: -1 },
    });
  } else if (payment.registrationType === "membership") {
    // RESET membership status
    await Membership.findByIdAndUpdate(payment.registrationId, {
      status: "pending_payment",
      paymentStatus: false,
    });
  }

  // 4. Send notification
  await NotificationService.notifyUserPaymentRejected(payment, reason);

  return res.json({ success: true, message: "Đã từ chối thanh toán" });
};
```

### 7.6. Kiểm tra phòng trống

#### **API Endpoint:**

```
GET /api/rooms/available/check
Query: date, startTime, endTime
```

#### **Algorithm:**

```javascript
export const checkAvailableRooms = async (req, res) => {
  const { date, startTime, endTime } = req.query;

  // 1. Get all rooms
  const allRooms = await Room.find({ status: "available" });

  // 2. Find classes on that date/time
  const dayOfWeek = getDayOfWeek(new Date(date));

  const conflictClasses = await Class.find({
    status: { $in: ["active", "pending"] },
    startDate: { $lte: new Date(date) },
    endDate: { $gte: new Date(date) },
    "schedule.dayOfWeek": dayOfWeek,
  }).populate("roomId");

  // 3. Filter classes with time overlap
  const occupiedRoomIds = conflictClasses
    .filter((cls) => {
      const schedule = cls.schedule.find((s) => s.dayOfWeek === dayOfWeek);
      return timeOverlap(
        { startTime, endTime },
        { startTime: schedule.startTime, endTime: schedule.endTime }
      );
    })
    .map((cls) => cls.roomId._id.toString());

  // 4. Separate available and conflict rooms
  const availableRooms = allRooms.filter(
    (room) => !occupiedRoomIds.includes(room._id.toString())
  );

  const conflictRooms = allRooms.filter((room) =>
    occupiedRoomIds.includes(room._id.toString())
  );

  return res.json({
    success: true,
    data: { availableRooms, conflictRooms },
  });
};
```

---

## 8. XÂY DỰNG API

### 8.1. RESTful API Design Principles

**Nguyên tắc thiết kế:**

1. **Resource-based URLs**

   - `/api/classes` (không phải `/api/getClasses`)
   - `/api/users/:id` (không phải `/api/user?id=123`)

2. **HTTP Methods**

   - GET: Lấy dữ liệu
   - POST: Tạo mới
   - PUT/PATCH: Cập nhật
   - DELETE: Xóa

3. **Status Codes**

   - 200: Success
   - 201: Created
   - 400: Bad Request (validation error)
   - 401: Unauthorized (chưa đăng nhập)
   - 403: Forbidden (không có quyền)
   - 404: Not Found
   - 500: Server Error

4. **Response Format**
   ```json
   {
     "success": true,
     "message": "Operation successful",
     "data": { ... }
   }
   ```

### 8.2. API Endpoints

#### **Authentication APIs**

```
POST   /api/auth/register          - Đăng ký tài khoản
POST   /api/auth/login             - Đăng nhập
GET    /api/auth/profile           - Lấy thông tin user hiện tại
PUT    /api/auth/profile           - Cập nhật profile
POST   /api/auth/change-password   - Đổi mật khẩu
```

#### **Admin APIs**

```
GET    /api/admin/dashboard-stats           - Thống kê tổng quan
GET    /api/admin/users                     - Danh sách users
POST   /api/admin/users                     - Tạo user mới
PUT    /api/admin/users/:id                 - Cập nhật user
DELETE /api/admin/users/:id                 - Xóa user

GET    /api/admin/schedule-change-requests  - Danh sách yêu cầu đổi lịch
PUT    /api/admin/schedule-change-requests/:id/:action  - Duyệt/từ chối
POST   /api/admin/schedule-change-requests/:id/makeup-schedule  - Thêm lịch bù

GET    /api/admin/trainers                  - Danh sách trainers
GET    /api/admin/trainer-schedule/:trainerId  - Lịch dạy của trainer
```

#### **Trainer APIs**

```
GET    /api/trainers/dashboard              - Dashboard trainer
GET    /api/trainers/classes                - Danh sách lớp đang dạy
GET    /api/trainers/class/:classId         - Chi tiết lớp học
GET    /api/trainers/class/:classId/full-schedule  - Lịch đầy đủ + attendance

POST   /api/trainers/attendance             - Điểm danh học viên
POST   /api/trainers/session-content        - Thêm nội dung buổi học

POST   /api/trainers/schedule-change-request  - Gửi yêu cầu đổi lịch
GET    /api/trainers/schedule-change-requests  - Xem yêu cầu của mình

GET    /api/trainers/check-schedule-conflict  - Kiểm tra xung đột lịch
GET    /api/trainers/check-makeup-schedule-conflict  - Kiểm tra xung đột lịch bù
```

#### **Class APIs**

```
GET    /api/classes                  - Danh sách lớp học
GET    /api/classes/:id              - Chi tiết lớp
POST   /api/classes                  - Tạo lớp mới (Admin)
PUT    /api/classes/:id              - Cập nhật lớp (Admin)
DELETE /api/classes/:id              - Xóa lớp (Admin)

POST   /api/classes/:id/enroll       - Đăng ký lớp (User)
GET    /api/classes/enrolled         - Lớp đã đăng ký (User)
```

#### **Membership APIs**

```
GET    /api/memberships              - Danh sách membership (Admin)
GET    /api/memberships/my           - Membership của user
POST   /api/memberships/register     - Đăng ký thẻ (User)
POST   /api/memberships/:id/renew    - Gia hạn thẻ (Admin/User)
```

#### **Payment APIs**

```
GET    /api/payments                 - Danh sách thanh toán (Admin)
GET    /api/payments/my              - Thanh toán của user
POST   /api/payments/upload-proof    - Upload proof of payment
PUT    /api/payments/:id/approve     - Duyệt thanh toán (Admin)
PUT    /api/payments/:id/reject      - Từ chối thanh toán (Admin)
```

#### **Room APIs**

```
GET    /api/rooms                    - Danh sách phòng
GET    /api/rooms/available/check    - Kiểm tra phòng trống
POST   /api/rooms                    - Tạo phòng (Admin)
PUT    /api/rooms/:id                - Cập nhật phòng (Admin)
DELETE /api/rooms/:id                - Xóa phòng (Admin)
```

#### **Maintenance APIs**

```
GET    /api/maintenance/trainer      - Lịch bảo trì (Trainer xem)
GET    /api/maintenance              - Danh sách bảo trì (Admin)
POST   /api/maintenance              - Tạo lịch bảo trì (Admin)
PUT    /api/maintenance/:id          - Cập nhật bảo trì (Admin)
```

#### **Notification APIs**

```
GET    /api/notifications            - Danh sách thông báo
PUT    /api/notifications/:id/read   - Đánh dấu đã đọc
POST   /api/notifications/read-all   - Đánh dấu tất cả đã đọc
```

### 8.3. API Documentation Example

#### **POST /api/classes**

**Description:** Tạo lớp học mới (Admin only)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "className": "Yoga Cơ Bản Buổi Sáng",
  "serviceName": "Yoga",
  "trainerId": "60d5f484f8d2e41234567890",
  "roomId": "60d5f484f8d2e41234567891",
  "schedule": [
    {
      "dayOfWeek": "Thứ 2",
      "startTime": "06:00",
      "endTime": "07:00"
    },
    {
      "dayOfWeek": "Thứ 4",
      "startTime": "06:00",
      "endTime": "07:00"
    }
  ],
  "startDate": "2024-12-15",
  "endDate": "2025-03-15",
  "maxStudents": 20,
  "totalSessions": 24,
  "price": 2000000,
  "description": "Lớp Yoga cho người mới bắt đầu"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Tạo lớp học thành công",
  "class": {
    "_id": "60d5f484f8d2e41234567892",
    "className": "Yoga Cơ Bản Buổi Sáng",
    "serviceName": "Yoga",
    "trainerId": { ... },
    "roomId": { ... },
    "schedule": [ ... ],
    "status": "pending",
    "currentStudents": 0,
    "createdAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Huấn luyện viên có lịch trùng vào Thứ 2 06:00-07:00",
  "conflicts": [
    {
      "className": "Yoga Nâng Cao",
      "time": "Thứ 2, 05:30 - 06:30"
    }
  ]
}
```

---

## 9. BẢO MẬT HỆ THỐNG

### 9.1. Authentication & Authorization

#### **JWT (JSON Web Token)**

**Token Structure:**

```
Header.Payload.Signature
```

**Payload:**

```json
{
  "id": "user_id",
  "role": "admin|trainer|user",
  "iat": 1670000000,
  "exp": 1670086400
}
```

**Token Generation:**

```javascript
const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
  expiresIn: "24h",
});
```

**Token Verification:**

```javascript
jwt.verify(token, JWT_SECRET, (err, decoded) => {
  if (err) return res.status(403).json({ message: "Invalid token" });
  req.user = decoded;
  next();
});
```

#### **Role-Based Access Control (RBAC)**

```javascript
// Middleware: verifyAdmin
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Chỉ admin mới có quyền truy cập",
    });
  }
  next();
};

// Middleware: verifyTrainer
export const verifyTrainer = (req, res, next) => {
  if (req.user.role !== "trainer") {
    return res.status(403).json({
      success: false,
      message: "Chỉ trainer mới có quyền truy cập",
    });
  }
  next();
};
```

**Protected Routes Example:**

```javascript
router.post(
  "/schedule-change-requests/:id/makeup-schedule",
  verifyToken, // Kiểm tra đã đăng nhập
  verifyAdmin, // Kiểm tra là admin
  addMakeupSchedule
);
```

### 9.2. Password Security

#### **Hashing với bcrypt**

```javascript
// Register: Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Login: Compare password
const isPasswordCorrect = await bcrypt.compare(inputPassword, user.password);
```

**Salt Rounds:** 10 (balance giữa security và performance)

### 9.3. Input Validation

#### **Backend Validation**

```javascript
// Mongoose Schema Validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email là bắt buộc"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
  },
  password: {
    type: String,
    required: [true, "Mật khẩu là bắt buộc"],
    minlength: [6, "Mật khẩu phải ít nhất 6 ký tự"],
  },
});

// Controller Validation
if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "Vui lòng cung cấp đầy đủ thông tin",
  });
}
```

#### **Frontend Validation**

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Email validation
  if (!email.match(/^\S+@\S+\.\S+$/)) {
    alert("Email không hợp lệ");
    return;
  }

  // Password validation
  if (password.length < 6) {
    alert("Mật khẩu phải ít nhất 6 ký tự");
    return;
  }

  // Submit...
};
```

### 9.4. File Upload Security

#### **Multer Configuration**

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
```

#### **Cloudinary Upload**

```javascript
const result = await cloudinary.uploader.upload(file.path, {
  folder: "gym-management/payments",
  resource_type: "image",
  allowed_formats: ["jpg", "png", "jpeg"],
});
```

### 9.5. Error Handling

#### **Try-Catch Pattern**

```javascript
export const someController = async (req, res) => {
  try {
    // Business logic
    const result = await someOperation();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in someController:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
```

#### **Global Error Handler**

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

### 9.6. Environment Variables

```env
# .env file
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secure_secret_key
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Security Best Practices:**

- Không commit `.env` vào Git
- Sử dụng `.env.example` template
- Rotate secrets định kỳ
- Sử dụng strong JWT_SECRET

### 9.7. CORS Configuration

```javascript
import cors from "cors";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

### 9.8. Rate Limiting (Optional)

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## 10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 10.1. Kết quả đạt được

#### **Về chức năng:**

✅ Hoàn thành đầy đủ các chức năng quản lý phòng tập:

- Quản lý người dùng với 3 vai trò
- Quản lý lớp học với kiểm tra xung đột thông minh
- Hệ thống điểm danh điện tử
- Quản lý thẻ thành viên với gia hạn tự động
- Xử lý thanh toán với logic reject thông minh
- Hệ thống thông báo real-time
- Dashboard thống kê cho admin
- Quản lý lịch bảo trì thiết bị

#### **Về kỹ thuật:**

✅ Áp dụng thành công:

- Kiến trúc MVC clean và maintainable
- RESTful API design chuẩn
- JWT authentication & RBAC
- Database optimization với indexing
- Responsive design với TailwindCSS
- Error handling và validation đầy đủ
- Security best practices

#### **Về trải nghiệm người dùng:**

✅ Giao diện thân thiện, dễ sử dụng
✅ Phản hồi nhanh, smooth
✅ Thông báo rõ ràng
✅ Mobile responsive

### 10.2. Hạn chế

#### **Chức năng:**

- Chưa tích hợp payment gateway tự động (VNPay, Momo...)
- Chưa có chức năng export báo cáo (Excel, PDF)
- Chưa có email notification
- Chưa có real-time chat support

#### **Kỹ thuật:**

- Chưa implement caching (Redis)
- Chưa có unit testing / integration testing
- Chưa optimize cho scale lớn (load balancing, clustering)
- Chưa có CI/CD pipeline

### 10.3. Hướng phát triển

#### **Ngắn hạn (1-3 tháng):**

1. **Tích hợp Payment Gateway**

   - VNPay / MoMo API
   - Thanh toán tự động
   - Webhook xử lý callback

2. **Email Notification System**

   - Nodemailer / SendGrid
   - Email template
   - Gửi thông báo quan trọng

3. **Export Reports**

   - Excel export (xlsx)
   - PDF export (pdfkit)
   - Báo cáo doanh thu, attendance...

4. **Mobile App**
   - React Native
   - Expo framework
   - Push notification

#### **Trung hạn (3-6 tháng):**

1. **Performance Optimization**

   - Redis caching
   - Database query optimization
   - Image lazy loading
   - Code splitting

2. **Testing**

   - Jest + Supertest (backend)
   - React Testing Library (frontend)
   - E2E testing với Cypress
   - Code coverage > 80%

3. **Advanced Features**

   - Video streaming cho online classes
   - AI recommendation system
   - Chatbot support
   - Multi-language support

4. **Analytics Dashboard**
   - Charts.js / Recharts
   - Revenue analytics
   - User behavior tracking
   - Trainer performance metrics

#### **Dài hạn (6-12 tháng):**

1. **Microservices Architecture**

   - Tách thành các service nhỏ
   - Message queue (RabbitMQ, Kafka)
   - API Gateway

2. **DevOps & CI/CD**

   - Docker containerization
   - Kubernetes orchestration
   - GitHub Actions / Jenkins
   - Automated deployment

3. **Advanced Security**

   - Two-factor authentication (2FA)
   - OAuth2.0 (Google, Facebook login)
   - Security audit
   - GDPR compliance

4. **IoT Integration**
   - Smart card check-in
   - Biometric attendance
   - Smart locker system

### 10.4. Bài học kinh nghiệm

#### **Kỹ thuật:**

- Thiết kế database tốt từ đầu giúp tiết kiệm thời gian sau này
- Validation cả frontend và backend là cần thiết
- Error handling tốt giúp debug nhanh hơn
- Code reusability quan trọng (components, functions)

#### **Quản lý dự án:**

- Chia nhỏ task giúp tracking progress tốt hơn
- Documentation quan trọng cho maintenance
- Version control (Git) là must-have
- Testing sớm giúp phát hiện bug sớm

#### **Học tập:**

- Đọc documentation chính thống
- Stack Overflow, GitHub cho reference
- Code review để học từ người khác
- Áp dụng best practices

### 10.5. Tổng kết

Đồ án đã hoàn thành mục tiêu đề ra: **Xây dựng hệ thống quản lý phòng tập thông minh** với đầy đủ chức năng cần thiết, áp dụng công nghệ hiện đại, và đảm bảo tính bảo mật.

Hệ thống có thể:

- **Tự động hóa** các quy trình quản lý
- **Giảm thiểu sai sót** trong điểm danh, thanh toán
- **Nâng cao trải nghiệm** người dùng
- **Hỗ trợ ra quyết định** thông qua thống kê

Đây là nền tảng tốt để phát triển thêm các tính năng nâng cao và scale lên mức production-ready.

---

## PHỤ LỤC

### A. Tài liệu tham khảo

**Documentation:**

- [Node.js Official Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

**Tutorials & Learning:**

- [MDN Web Docs](https://developer.mozilla.org/)
- [freeCodeCamp](https://www.freecodecamp.org/)
- [YouTube Tutorials](various channels)

### B. GitHub Repository

```
https://github.com/yourusername/gym-management-system
```

### C. Team Members & Contributions

| Tên      | Vai trò              | Công việc        |
| -------- | -------------------- | ---------------- |
| [Tên SV] | Full-stack Developer | Toàn bộ hệ thống |

### D. Timeline

| Giai đoạn      | Thời gian  | Công việc                            |
| -------------- | ---------- | ------------------------------------ |
| 1. Planning    | Tuần 1-2   | Phân tích yêu cầu, thiết kế database |
| 2. Backend     | Tuần 3-6   | Xây dựng API, models, controllers    |
| 3. Frontend    | Tuần 7-10  | Xây dựng UI/UX components            |
| 4. Integration | Tuần 11-12 | Kết nối FE-BE, testing               |
| 5. Deployment  | Tuần 13    | Deploy và final testing              |

---

**HẾT**

---

_Báo cáo này được soạn thảo chi tiết để phục vụ mục đích báo cáo đồ án. Mọi thông tin đều dựa trên code thực tế đã implement._

_Cập nhật lần cuối: 13/12/2025_
