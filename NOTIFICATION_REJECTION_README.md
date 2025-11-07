# Hệ Thống Thông Báo (Notification System)

## 📋 Tổng Quan

Hệ thống thông báo toàn diện cho ứng dụng quản lý phòng gym, hỗ trợ gửi thông báo real-time đến User và Trainer về các sự kiện quan trọng như thanh toán, đăng ký lớp học, điểm danh, và các hoạt động khác.

---

## 🎯 Các Loại Thông Báo

### 1. Thông Báo Cho User (Member)

#### 1.1 Thanh Toán (Payment Notifications)

**a) Thanh toán được chấp nhận**

```
✅ Thanh toán thành công
💰 Thanh toán [số tiền]đ của bạn đã được xác nhận.
📝 Chi tiết: [Gói thành viên / Lớp học]
🎉 Bạn đã sẵn sàng để tập luyện!
```

**b) Thanh toán bị từ chối**

```
⚠️ Yêu cầu thanh toán bị từ chối
💰 Thanh toán [số tiền]đ của bạn đã bị từ chối.
📝 Lý do: [Lý do cụ thể từ admin]
🔄 Hành động: Vui lòng kiểm tra lại thông tin và thanh toán lại
📞 Hỗ trợ: Liên hệ admin nếu cần trợ giúp
```

**c) Thanh toán đang chờ xử lý**

```
⏳ Thanh toán đang được xử lý
💰 Chúng tôi đã nhận được yêu cầu thanh toán [số tiền]đ
⏱️ Admin đang xem xét, vui lòng chờ trong 24h
```

#### 1.2 Đăng Ký Lớp Học (Class Enrollment)

**a) Đăng ký thành công**

```
🎓 Đăng ký lớp học thành công
📚 Lớp: [Tên lớp]
👨‍🏫 Huấn luyện viên: [Tên trainer]
📅 Lịch học: [Thời gian]
📍 Phòng: [Số phòng]
```

**b) Lớp học sắp bắt đầu (Reminder)**

```
⏰ Nhắc nhở: Lớp học sắp bắt đầu
📚 Lớp: [Tên lớp]
🕐 Thời gian: [Còn 30 phút nữa]
📍 Phòng: [Số phòng]
💪 Chuẩn bị sẵn sàng nhé!
```

**c) Hủy đăng ký lớp học**

```
❌ Đăng ký lớp học đã bị hủy
📚 Lớp: [Tên lớp]
📝 Lý do: [Thanh toán bị từ chối / Lớp đầy]
🔄 Bạn có thể đăng ký lớp học khác
```

#### 1.3 Gói Thành Viên (Membership)

**a) Kích hoạt thành viên**

```
🎊 Chào mừng bạn trở thành thành viên
💳 Gói: [Basic/Premium/VIP]
📅 Hiệu lực: [Ngày bắt đầu - Ngày kết thúc]
🎁 Quyền lợi: [Danh sách quyền lợi]
```

**b) Gói thành viên sắp hết hạn**

```
⚠️ Gói thành viên sắp hết hạn
💳 Gói: [Tên gói]
📅 Hết hạn: [Còn 7 ngày]
🔄 Gia hạn ngay để tiếp tục sử dụng dịch vụ
```

**c) Gói thành viên đã hết hạn**

```
❌ Gói thành viên đã hết hạn
💳 Gói: [Tên gói]
📅 Hết hạn: [Ngày hết hạn]
🔄 Gia hạn ngay để tiếp tục tập luyện
```

**d) Nâng cấp gói thành viên thành công**

```
⬆️ Nâng cấp gói thành công
💳 Gói mới: [Premium/VIP]
🎁 Quyền lợi mới: [Danh sách quyền lợi]
✨ Tận hưởng dịch vụ cao cấp!
```

#### 1.4 Điểm Danh (Attendance)

**a) Điểm danh thành công**

```
✅ Điểm danh thành công
📚 Lớp: [Tên lớp]
📅 Buổi học: [Số buổi / Tổng buổi]
⭐ Tiếp tục phát huy nhé!
```

**b) Vắng mặt không lý do**

```
⚠️ Ghi nhận vắng mặt
📚 Lớp: [Tên lớp]
📅 Buổi học: [Ngày tháng]
📝 Lưu ý: Liên hệ trainer nếu có lý do chính đáng
```

#### 1.5 Phản Hồi (Feedback)

**a) Phản hồi được xử lý**

```
📬 Phản hồi của bạn đã được xem xét
📝 Nội dung: [Tóm tắt phản hồi]
💬 Trả lời: [Phản hồi từ admin]
🙏 Cảm ơn bạn đã đóng góp ý kiến!
```

### 2. Thông Báo Cho Trainer

#### 2.1 Lớp Học (Class Management)

**a) Học viên mới đăng ký**

```
👥 Học viên mới đăng ký lớp
📚 Lớp: [Tên lớp]
👤 Học viên: [Tên học viên]
📊 Tổng số học viên: [Hiện tại/Tối đa]
```

**b) Lớp học sắp bắt đầu**

```
⏰ Lớp học sắp bắt đầu
📚 Lớp: [Tên lớp]
🕐 Thời gian: [Còn 15 phút]
📍 Phòng: [Số phòng]
👥 Số học viên: [Số lượng]
```

**c) Học viên hủy đăng ký**

```
❌ Học viên đã hủy đăng ký
📚 Lớp: [Tên lớp]
👤 Học viên: [Tên học viên]
📊 Số học viên còn lại: [Số lượng]
```

**d) Lớp học đã đầy**

```
✅ Lớp học đã đủ học viên
📚 Lớp: [Tên lớp]
👥 Số học viên: [Tối đa]
🎉 Sẵn sàng cho khóa học!
```

#### 2.2 Điểm Danh (Attendance)

**a) Nhắc nhở điểm danh**

```
📋 Đã đến giờ điểm danh
📚 Lớp: [Tên lớp]
👥 Số học viên: [Số lượng]
✅ Vui lòng điểm danh cho học viên
```

**b) Hoàn thành điểm danh**

```
✅ Điểm danh hoàn tất
📚 Lớp: [Tên lớp]
📊 Có mặt: [Số lượng] / [Tổng số]
📅 Buổi học: [Số buổi]
```

#### 2.3 Lịch Dạy (Schedule)

**a) Thay đổi lịch dạy**

```
🔄 Lịch dạy có thay đổi
📚 Lớp: [Tên lớp]
📅 Lịch cũ: [Thời gian cũ]
📅 Lịch mới: [Thời gian mới]
📝 Lý do: [Lý do thay đổi]
```

**b) Yêu cầu thay đổi lịch được duyệt**

```
✅ Yêu cầu thay đổi lịch được chấp nhận
📚 Lớp: [Tên lớp]
📅 Lịch mới: [Thời gian mới]
💬 Ghi chú từ admin: [Ghi chú]
```

**c) Yêu cầu thay đổi lịch bị từ chối**

```
❌ Yêu cầu thay đổi lịch bị từ chối
📚 Lớp: [Tên lớp]
📝 Lý do: [Lý do từ chối]
💬 Ghi chú: [Ghi chú từ admin]
```

#### 2.4 Phản Hồi (Feedback)

**a) Nhận phản hồi từ học viên**

```
⭐ Nhận đánh giá mới từ học viên
📚 Lớp: [Tên lớp]
👤 Học viên: [Tên học viên]
⭐ Đánh giá: [Số sao]
💬 Nhận xét: [Nội dung]
```

### 3. Thông Báo Hệ Thống (System Notifications)

#### 3.1 Bảo Trì

```
🔧 Bảo trì hệ thống
⏰ Thời gian: [Thời gian bảo trì]
⚠️ Ảnh hưởng: [Các chức năng bị ảnh hưởng]
💡 Khuyến nghị: [Hành động nên làm]
```

#### 3.2 Cập Nhật

```
🆕 Phiên bản mới có sẵn
✨ Tính năng mới: [Danh sách tính năng]
🔄 Vui lòng cập nhật ứng dụng
```

---

## 🛠️ Chức Năng Chi Tiết

### 1. Gửi Thông Báo Tự Động

#### Khi Admin Từ Chối Thanh Toán

```javascript
// Backend: paymentController.js - rejectPayment()
const notification = await Notification.create({
  user: payment.user,
  type: "payment-rejected",
  title: "⚠️ Yêu cầu thanh toán bị từ chối",
  message: `💰 Thanh toán ${payment.amount.toLocaleString()}đ của bạn đã bị từ chối...`,
  relatedId: payment._id,
  isRead: false,
});
```

#### Khi Học Viên Đăng Ký Lớp

```javascript
// Gửi thông báo cho User
await Notification.create({
  user: userId,
  type: "class-enrolled",
  title: "🎓 Đăng ký lớp học thành công",
  message: `Bạn đã đăng ký lớp ${className}...`,
});

// Gửi thông báo cho Trainer
await Notification.create({
  user: trainerId,
  type: "new-student",
  title: "👥 Học viên mới đăng ký lớp",
  message: `${studentName} đã đăng ký lớp ${className}...`,
});
```

#### Khi Điểm Danh

```javascript
// Gửi cho học viên
await Notification.create({
  user: studentId,
  type: "attendance-marked",
  title: "✅ Điểm danh thành công",
  message: `Buổi học ${sessionNumber}/${totalSessions}...`,
});
```

### 2. API Endpoints

#### 2.1 Lấy Danh Sách Thông Báo

```http
GET /api/notifications
Authorization: Bearer [token]
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - type: string (optional) - Lọc theo loại
  - isRead: boolean (optional) - Lọc theo trạng thái đọc

Response:
{
  "notifications": [
    {
      "_id": "notification_id",
      "user": "user_id",
      "type": "payment-rejected",
      "title": "⚠️ Yêu cầu thanh toán bị từ chối",
      "message": "...",
      "relatedId": "payment_id",
      "isRead": false,
      "createdAt": "2025-10-28T...",
      "updatedAt": "2025-10-28T..."
    }
  ],
  "unreadCount": 5,
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 2
}
```

#### 2.2 Đánh Dấu Đã Đọc

```http
PUT /api/notifications/:id/read
Authorization: Bearer [token]

Response:
{
  "success": true,
  "message": "Đã đánh dấu thông báo là đã đọc",
  "notification": { ... }
}
```

#### 2.3 Đánh Dấu Tất Cả Đã Đọc

```http
PUT /api/notifications/mark-all-read
Authorization: Bearer [token]

Response:
{
  "success": true,
  "message": "Đã đánh dấu tất cả thông báo là đã đọc",
  "updatedCount": 5
}
```

#### 2.4 Xóa Thông Báo

```http
DELETE /api/notifications/:id
Authorization: Bearer [token]

Response:
{
  "success": true,
  "message": "Đã xóa thông báo thành công"
}
```

#### 2.5 Gửi Lại Thông Báo (Admin Only)

```http
POST /api/payment/resend-notification/:paymentId
Authorization: Bearer [admin_token]

Response:
{
  "success": true,
  "message": "Đã gửi lại thông báo thành công",
  "notification": {
    "id": "notification_id",
    "recipient": "username",
    "title": "⚠️ Yêu cầu thanh toán bị từ chối"
  }
}
```

#### 2.6 Lấy Số Lượng Thông Báo Chưa Đọc

```http
GET /api/notifications/unread-count
Authorization: Bearer [token]

Response:
{
  "unreadCount": 5
}
```

---

## 📊 Database Schema

### Notification Model

```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'payment-rejected',
      'payment-approved',
      'payment-pending',
      'class-enrolled',
      'class-cancelled',
      'class-reminder',
      'membership-activated',
      'membership-expiring',
      'membership-expired',
      'membership-upgraded',
      'attendance-marked',
      'attendance-missed',
      'feedback-replied',
      'new-student',        // For trainer
      'class-starting',     // For trainer
      'student-cancelled',  // For trainer
      'class-full',         // For trainer
      'attendance-reminder',// For trainer
      'schedule-changed',   // For trainer
      'schedule-approved',  // For trainer
      'schedule-rejected',  // For trainer
      'student-feedback',   // For trainer
      'system-maintenance',
      'system-update'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: ObjectId }, // Link to Payment, Class, Membership, etc.
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 🔄 Workflow Thông Báo

### 1. Workflow Thanh Toán

```
User thanh toán
    ↓
Admin xem xét
    ↓
┌───────────────────┬───────────────────┐
│                   │                   │
Chấp nhận          Từ chối           Chờ xử lý
│                   │                   │
↓                   ↓                   ↓
Thông báo          Thông báo          Thông báo
"Thanh toán        "Thanh toán        "Đang xử lý"
thành công"        bị từ chối"
│                   │
↓                   ↓
Kích hoạt          Hủy đăng ký
dịch vụ            + Gửi email
```

### 2. Workflow Lớp Học

```
User đăng ký lớp
    ↓
Tạo enrollment (pending_payment)
    ↓
Thông báo cho User: "Đăng ký thành công, chờ thanh toán"
    ↓
Thông báo cho Trainer: "Học viên mới đăng ký"
    ↓
User thanh toán
    ↓
Admin duyệt
    ↓
┌───────────────────┬───────────────────┐
│                   │                   │
Chấp nhận          Từ chối
│                   │
↓                   ↓
Enrollment active  Enrollment cancelled
│                   │
Thông báo User     Thông báo User
+ Trainer          + Trainer
```

### 3. Workflow Điểm Danh

```
Trainer mở buổi học
    ↓
Thông báo cho Trainer: "Đã đến giờ điểm danh"
    ↓
Trainer điểm danh từng học viên
    ↓
┌───────────────────┬───────────────────┐
│                   │                   │
Có mặt            Vắng mặt
│                   │
↓                   ↓
Thông báo:         Thông báo:
"Điểm danh         "Vắng mặt"
thành công"
    ↓
Hoàn thành buổi học
    ↓
Thông báo cho Trainer: "Điểm danh hoàn tất"
```

---

## 🔐 Phân Quyền

### User (Member)

- ✅ Xem thông báo của chính mình
- ✅ Đánh dấu đã đọc
- ✅ Xóa thông báo
- ❌ Không thể xem thông báo của người khác
- ❌ Không thể gửi thông báo

### Trainer

- ✅ Xem thông báo về lớp học của mình
- ✅ Xem thông báo về học viên
- ✅ Đánh dấu đã đọc
- ✅ Xóa thông báo
- ❌ Không thể xem thông báo của trainer khác

### Admin

- ✅ Gửi thông báo cho bất kỳ user nào
- ✅ Gửi lại thông báo
- ✅ Xem tất cả thông báo (trong admin panel)
- ✅ Xóa thông báo

---

## 🎨 UI/UX Guidelines

### 1. Badge Thông Báo

```
- Hiển thị số lượng thông báo chưa đọc
- Màu đỏ với số trắng
- Tối đa hiển thị 99+
- Real-time update
```

### 2. Danh Sách Thông Báo

```
- Thông báo chưa đọc: Background màu nhạt
- Thông báo đã đọc: Background trắng
- Icon phù hợp với loại thông báo
- Thời gian hiển thị dạng "5 phút trước", "2 giờ trước"
- Swipe để xóa
- Pull to refresh
```

### 3. Chi Tiết Thông Báo

```
- Hiển thị đầy đủ nội dung
- Nút hành động (nếu có): "Xem chi tiết", "Thanh toán lại"
- Tự động đánh dấu đã đọc khi mở
```

### 4. Âm Thanh & Rung

```
- Phát âm thanh khi có thông báo mới (có thể tắt)
- Rung nhẹ khi có thông báo quan trọng
- Khác nhau theo loại thông báo
```

---

## 📱 Push Notification (Tương lai)

### Cấu hình Firebase Cloud Messaging

```javascript
// Gửi push notification
const message = {
  notification: {
    title: notification.title,
    body: notification.message,
  },
  token: userDeviceToken,
  data: {
    type: notification.type,
    relatedId: notification.relatedId,
  },
};

await admin.messaging().send(message);
```

---

## 🧪 Testing

### 1. Test Thông Báo Thanh Toán

```bash
# Tạo payment và từ chối
cd backend
node test-notification-rejection.js
```

### 2. Test Thông Báo Lớp Học

```bash
# Test đăng ký lớp
POST /api/classes/:classId/enroll
# Kiểm tra notification cho user và trainer
GET /api/notifications
```

### 3. Test API

```bash
# Lấy danh sách thông báo
GET /api/notifications

# Đánh dấu đã đọc
PUT /api/notifications/:id/read

# Xóa thông báo
DELETE /api/notifications/:id
```

---

## 📈 Monitoring & Analytics

### Metrics cần theo dõi

```
1. Số lượng thông báo được gửi / ngày
2. Tỷ lệ thông báo được đọc
3. Thời gian trung bình từ gửi đến đọc
4. Thông báo nào được đọc nhiều nhất
5. Thông báo nào bị xóa nhiều nhất
6. Lỗi khi gửi thông báo
```

### Logging

```javascript
// Success
console.log(`✅ Notification sent: ${type} to user ${userId}`);

// Error
console.error(`❌ Failed to send notification: ${error.message}`);
```

---

## 🚀 Tính Năng Mở Rộng

### 1. Email Notification

- Gửi email song song với in-app notification
- Cho các thông báo quan trọng

### 2. SMS Notification

- Cho gói VIP
- Nhắc nhở lớp học, hết hạn thẻ

### 3. Notification Settings

- User tùy chỉnh loại thông báo muốn nhận
- Tắt/Bật âm thanh, rung
- Chọn thời gian nhận thông báo

### 4. Notification Templates

- Admin tạo template
- Tự động điền thông tin
- A/B testing message

### 5. Real-time Notification

- WebSocket/Socket.IO
- Cập nhật ngay lập tức
- Không cần reload

---

## 📚 Code Examples

### Gửi Thông Báo Trong Controller

```javascript
// services/NotificationService.js
async sendPaymentRejectionNotification(payment, rejectionReason) {
  const notification = await Notification.create({
    user: payment.user,
    type: 'payment-rejected',
    title: '⚠️ Yêu cầu thanh toán bị từ chối',
    message: this.formatPaymentRejectionMessage(payment, rejectionReason),
    relatedId: payment._id
  });

  // TODO: Send push notification
  // await this.sendPushNotification(notification);

  return notification;
}
```

### Frontend - Hiển Thị Thông Báo

```javascript
// React/Flutter
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const response = await api.get("/api/notifications");
    setNotifications(response.data.notifications);
    setUnreadCount(response.data.unreadCount);
  };

  const markAsRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    fetchNotifications();
  };

  return (
    <div>
      <Badge count={unreadCount}>
        <BellIcon />
      </Badge>
      {notifications.map((notif) => (
        <NotificationItem
          key={notif._id}
          notification={notif}
          onRead={() => markAsRead(notif._id)}
        />
      ))}
    </div>
  );
};
```

---

## ✅ Checklist Triển Khai

- [x] Tạo Notification Model
- [x] API endpoints cơ bản
- [x] Gửi thông báo thanh toán
- [ ] Gửi thông báo lớp học
- [ ] Gửi thông báo membership
- [ ] Gửi thông báo điểm danh
- [ ] Frontend UI thông báo
- [ ] Real-time updates
- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification settings
- [ ] Analytics & monitoring

---

## 📞 Support

Liên hệ team dev nếu cần hỗ trợ về hệ thống thông báo.

## Cấu trúc thông báo

### Tiêu đề

```
⚠️ Yêu cầu thanh toán bị từ chối
```

### Nội dung thông báo

```
💰 Thanh toán [số tiền]đ của bạn đã bị từ chối.

📝 Lý do từ chối: [lý do cụ thể]

[Thông tin chi tiết theo loại đăng ký]

🔄 Hành động tiếp theo:
[Hướng dẫn cụ thể cho từng loại]

📞 Hỗ trợ: [Thông tin liên hệ]
```

### Phân biệt theo loại đăng ký

#### Class Registration

```
🎓 Đăng ký lớp học của bạn đã bị hủy bỏ.
🔄 Bạn có thể đăng ký lại lớp học này hoặc chọn lớp khác phù hợp.
```

#### Membership

```
💳 Gói thành viên của bạn đã được đặt lại trạng thái chờ thanh toán.
🔄 Bạn có thể thực hiện thanh toán lại để kích hoạt gói thành viên.
```

#### Mixed (Membership + Class)

```
📋 Đăng ký gói thành viên và lớp học đã được khôi phục về trạng thái ban đầu.
🔄 Bạn có thể đăng ký lại hoặc liên hệ admin để được hỗ trợ.
```

## API Endpoints

### 1. Từ chối thanh toán (có thông báo)

```http
PUT /api/payment/reject/:paymentId
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "rejectionReason": "Thông tin chuyển khoản không chính xác"
}
```

**Response:**

```json
{
  "message": "Từ chối thanh toán thành công",
  "payment": {...},
  "updateResults": [...],
  "notification": {
    "sent": true,
    "message": "Đã gửi thông báo chi tiết cho người dùng",
    "error": null
  }
}
```

### 2. Gửi lại thông báo

```http
POST /api/payment/resend-notification/:paymentId
Authorization: Bearer [admin_token]
```

**Response:**

```json
{
  "success": true,
  "message": "Đã gửi lại thông báo thành công",
  "notification": {
    "id": "notification_id",
    "recipient": "username",
    "title": "⚠️ Yêu cầu thanh toán bị từ chối"
  }
}
```

### 3. Lấy thông báo của user

```http
GET /api/notifications
Authorization: Bearer [user_token]
```

**Response:**

```json
{
  "notifications": [
    {
      "_id": "notification_id",
      "title": "⚠️ Yêu cầu thanh toán bị từ chối",
      "message": "...",
      "type": "payment-rejected",
      "isRead": false,
      "createdAt": "2025-10-09T...",
      "relatedId": "payment_id"
    }
  ],
  "unreadCount": 3
}
```

## Database

### Notification Model

- ✅ Đã thêm type `"payment-rejected"` vào enum
- ✅ Lưu relatedId để link với payment
- ✅ Track trạng thái đọc/chưa đọc

### Payment Model

- ✅ Lưu `rejectionReason`, `rejectedAt`, `rejectedBy`
- ✅ Status `"cancelled"` cho payment bị từ chối

## Workflow hoàn chỉnh

### 1. Admin từ chối payment

```
Admin → API reject → Payment status = cancelled →
Registrations reset → Notification sent → User notified
```

### 2. User nhận thông báo

```
User → Check notifications → See rejection →
Understand reason → Take action (re-register/contact admin)
```

### 3. Error handling

```
Notification failed → Log error → Continue process →
Admin can resend notification later
```

## Testing

### 1. Manual Test

```bash
# Tạo payment pending
POST /api/payment

# Admin từ chối
PUT /api/payment/reject/:id

# Check user notifications
GET /api/notifications

# Resend notification nếu cần
POST /api/payment/resend-notification/:id
```

### 2. Script Test

```bash
cd backend
node test-notification-rejection.js
```

### 3. Debug Routes

```bash
# Check pending payments
GET /api/debug/pending-payments

# Check specific payment
GET /api/debug/test-payment-rejection/:id
```

## Monitoring & Logs

### Successful notification

```
✅ Payment rejection notification sent successfully to user: username - Notification ID: xxx
```

### Failed notification

```
❌ Error sending payment rejection notification: error_details
```

### Resend notification

```
✅ Payment rejection notification resent successfully to user: username - Notification ID: xxx
```

## Security

- ✅ Chỉ admin có thể từ chối payment và gửi lại thông báo
- ✅ Validate payment ID và trạng thái
- ✅ User chỉ nhận thông báo của chính mình
- ✅ Không expose sensitive payment info trong notification

## Performance

- ✅ Notification gửi bất đồng bộ, không block reject process
- ✅ Error trong notification không làm fail reject payment
- ✅ Có thể gửi lại notification nếu thất bại
- ✅ Log đầy đủ để monitoring

## User Experience

- ✅ Thông báo thân thiện với emoji
- ✅ Giải thích rõ ràng điều gì đã xảy ra
- ✅ Hướng dẫn bước tiếp theo
- ✅ Thông tin liên hệ hỗ trợ
- ✅ Phân biệt loại đăng ký để thông báo phù hợp
