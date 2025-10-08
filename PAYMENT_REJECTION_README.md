# Payment Rejection Logic - Cải tiến chức năng từ chối thanh toán

## Tổng quan

Đã cải tiến chức năng từ chối thanh toán của admin để đảm bảo:

1. Trả về trạng thái ban đầu cho user khi chưa đăng ký
2. Gửi thông báo chi tiết cho user
3. Xử lý chính xác cho cả ClassEnrollment và Membership

## Thay đổi chính

### 1. PaymentController.js - rejectPayment()

**Cải tiến:**

- Populate user information để gửi thông báo
- Kiểm tra trạng thái payment tránh reject nhiều lần
- Thêm thông tin chi tiết về việc reject (rejectedAt, rejectedBy)
- Xử lý khác nhau cho ClassEnrollment và Membership:
  - **ClassEnrollment**: Xóa hoàn toàn (trả về trạng thái chưa đăng ký)
  - **Membership**: Reset về `pending_payment` status
- Trả về thông tin chi tiết về các thay đổi

**Logic xử lý:**

```javascript
// Với ClassEnrollment - xóa hoàn toàn
await ClassEnrollment.findByIdAndDelete(regId);

// Với Membership - reset về pending
membership.status = "pending_payment";
membership.paymentStatus = false;
await membership.save();
```

### 2. NotificationService.js - notifyUserPaymentRejected()

**Cải tiến:**

- Thông báo chi tiết hơn với giải thích rõ ràng
- Hướng dẫn user về các bước tiếp theo
- Phân biệt loại đăng ký để thông báo phù hợp

**Nội dung thông báo:**

- Tiêu đề: "Yêu cầu thanh toán bị từ chối"
- Thông tin số tiền và lý do từ chối
- Giải thích trạng thái mới của đăng ký
- Hướng dẫn liên hệ admin hoặc thanh toán lại

### 3. Debug Routes

**Thêm mới:**

- `/debug/test-payment-rejection/:paymentId` - Kiểm tra thông tin payment
- `/debug/pending-payments` - Lấy danh sách payment pending

## Trạng thái sau khi reject

### ClassEnrollment

- **Trước**: `paymentStatus: false, status: active`
- **Sau reject**: Bị xóa hoàn toàn (user phải đăng ký lại)
- **Lý do**: Class enrollment chỉ tồn tại khi user thực sự muốn tham gia

### Membership

- **Trước**: `paymentStatus: false, status: active/pending`
- **Sau reject**: `paymentStatus: false, status: pending_payment`
- **Lý do**: Membership có thể được thanh toán lại mà không cần tạo mới

## Cách sử dụng

### Cho Admin:

1. Truy cập danh sách payment pending
2. Chọn payment cần từ chối
3. Nhập lý do từ chối (optional)
4. Xác nhận từ chối
5. Hệ thống tự động:
   - Cập nhật payment status
   - Trả về trạng thái ban đầu cho registrations
   - Gửi thông báo cho user

### Cho User:

1. Nhận thông báo về việc payment bị từ chối
2. Xem lý do từ chối
3. Liên hệ admin nếu cần thiết
4. Thực hiện lại việc đăng ký/thanh toán

## Test

### Manual Test:

```bash
# Lấy danh sách pending payments
GET /api/debug/pending-payments

# Kiểm tra payment cụ thể
GET /api/debug/test-payment-rejection/:paymentId

# Từ chối payment
POST /api/payment/reject/:paymentId
{
  "rejectionReason": "Thông tin thanh toán không chính xác"
}
```

### Script Test:

```bash
cd backend
node test-payment-rejection.js
```

## Error Handling

1. **Payment không tồn tại**: Return 404
2. **Payment đã bị reject**: Return 400 với thông báo
3. **Lỗi update registrations**: Log error nhưng không dừng process
4. **Lỗi gửi notification**: Log error nhưng không dừng process
5. **Database errors**: Return 500 với error message

## Logging

Tất cả các bước đều được log để dễ debug:

- Payment rejection info
- Registration update results
- Notification sending status
- Error details

## Security

- Chỉ admin mới có thể reject payment
- Validate payment ID
- Kiểm tra trạng thái payment trước khi reject
- Populate minimal user info cần thiết

## Performance

- Xử lý từng registration một để tránh lỗi mass update
- Không dừng process nếu có lỗi nhỏ
- Log chi tiết để monitoring
