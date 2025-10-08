# Hệ thống thông báo từ chối thanh toán - Cải tiến

## Tổng quan

Đã cải tiến và hoàn thiện hệ thống thông báo khi admin từ chối thanh toán, đảm bảo user nhận được thông tin chi tiết và thân thiện.

## Tính năng chính

### 1. Thông báo tự động khi từ chối thanh toán

- ✅ Gửi thông báo ngay khi admin từ chối payment
- ✅ Thông báo chi tiết với emoji và format đẹp
- ✅ Phân biệt loại đăng ký (class, membership, mixed)
- ✅ Hướng dẫn hành động tiếp theo cho user

### 2. API gửi lại thông báo

- ✅ Route: `POST /api/payment/resend-notification/:paymentId`
- ✅ Chỉ admin mới có thể sử dụng
- ✅ Chỉ áp dụng cho payment đã bị từ chối

### 3. Log chi tiết

- ✅ Track việc gửi thông báo thành công/thất bại
- ✅ Notification ID để debug
- ✅ User info trong log

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
