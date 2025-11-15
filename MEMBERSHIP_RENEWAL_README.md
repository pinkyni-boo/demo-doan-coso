# Chức năng Gia hạn Thẻ Thành Viên (Membership Renewal)

## 📋 Tổng quan

Chức năng cho phép Admin gia hạn thẻ thành viên trực tiếp từ trang "Quản lý thẻ thành viên" mà không cần tạo trang mới.

## 🎯 Tính năng chính

### 1. Nút "Gia hạn thẻ"

- **Hiển thị cho các thẻ:**
  - ✅ Sắp hết hạn (≤ 7 ngày so với ngày hiện tại) - có biểu tượng ⚠️
  - ✅ Đã hết hạn - có biểu tượng 🔴
  - ✅ Đang hoạt động (admin muốn gia hạn sớm)
  - ❌ KHÔNG hiển thị cho thẻ đã hủy

### 2. Modal Gia hạn

Khi admin bấm "Gia hạn thẻ", modal hiển thị:

#### Thông tin thẻ hiện tại:

- Tên thành viên
- Loại thẻ
- Ngày bắt đầu
- Ngày hết hạn cũ
- Badge trạng thái (Đã hết hạn / Sắp hết hạn)

#### Chọn gói gia hạn mới:

```
- basic-monthly: 500,000đ (30 ngày)
- standard-monthly: 800,000đ (30 ngày)
- vip-monthly: 1,200,000đ (30 ngày)
- basic-quarterly: 1,400,000đ (90 ngày)
- standard-quarterly: 2,200,000đ (90 ngày)
- vip-quarterly: 3,300,000đ (90 ngày)
- basic-annual: 5,000,000đ (365 ngày)
- standard-annual: 8,000,000đ (365 ngày)
- vip-annual: 12,000,000đ (365 ngày)
```

#### Thông tin gia hạn mới (tự động tính toán):

- **Ngày bắt đầu mới:**
  - Nếu thẻ đã hết hạn → Bắt đầu từ hôm nay
  - Nếu thẻ còn hạn → Bắt đầu từ ngày sau khi hết hạn cũ
- **Ngày hết hạn mới:** startDate + duration của gói
- **Giá gói mới:** Hiển thị rõ ràng
- **Preview:** "Gia hạn từ DD/MM/YYYY sang DD/MM/YYYY"

#### Trạng thái thanh toán:

- ☑️ Checkbox "Đã thanh toán (kích hoạt ngay)"
- Nếu chưa check → Thẻ sẽ ở trạng thái "Chờ thanh toán"

### 3. Khi xác nhận gia hạn

**Backend API:** `POST /api/memberships/renew/:id`

**Request Body:**

```json
{
  "type": "vip-monthly",
  "price": 1200000,
  "paymentStatus": true
}
```

**Response:**

```json
{
  "message": "Gia hạn thẻ thành viên thành công",
  "membership": {
    "_id": "...",
    "type": "vip-monthly",
    "startDate": "2025-11-16T00:00:00.000Z",
    "endDate": "2025-12-16T00:00:00.000Z",
    "status": "active",
    "paymentStatus": true,
    "price": 1200000,
    ...
  }
}
```

**Cập nhật:**

- ✅ `startDate` = newStart
- ✅ `endDate` = newEnd
- ✅ `type` = newPackageType
- ✅ `status` = "active"
- ✅ `paymentStatus` = true/false (theo checkbox)
- ✅ Badge trạng thái tự động cập nhật trong bảng

## 🔧 Cấu trúc Code

### Backend

**File:** `backend/controllers/membershipController.js`

- Function: `renewMembership(req, res)`
- Tính toán ngày tự động
- Validation không cho gia hạn thẻ đã hủy
- Transaction-safe với MongoDB session

**File:** `backend/routes/membershipRoutes.js`

```javascript
router.post("/renew/:id", verifyToken, verifyAdmin, renewMembership);
```

### Frontend

**File:** `src/components/Admin/MembershipManagement.jsx`

**State quản lý:**

```javascript
const [showRenewModal, setShowRenewModal] = useState(false);
const [membershipToRenew, setMembershipToRenew] = useState(null);
const [renewalPackage, setRenewalPackage] = useState("");
const [renewalPaymentStatus, setRenewalPaymentStatus] = useState(true);
```

**Functions:**

- `isExpiringSoon(endDate)` - Kiểm tra thẻ sắp hết hạn (≤7 ngày)
- `isExpired(endDate)` - Kiểm tra thẻ đã hết hạn
- `calculateRenewalDates(oldEndDate, packageType)` - Tính toán ngày mới
- `openRenewModal(membership)` - Mở modal
- `handleRenewMembership()` - Xử lý gia hạn
- `formatDate(dateString)` - Format ngày DD/MM/YYYY
- `formatPrice(price)` - Format giá VNĐ

**Gói thẻ:**

```javascript
const membershipPackages = {
  "basic-monthly": { name: "Basic - Tháng", price: 500000, duration: 30 },
  "standard-monthly": { name: "Standard - Tháng", price: 800000, duration: 30 },
  "vip-monthly": { name: "VIP - Tháng", price: 1200000, duration: 30 },
  // ... các gói khác
};
```

## 📝 Quy trình sử dụng

### Bước 1: Vào trang Quản lý thẻ thành viên

- Admin login
- Navigate to `/admin/memberships`

### Bước 2: Xác định thẻ cần gia hạn

- Xem bảng danh sách
- Thẻ "Sắp hết hạn" có badge màu vàng và nút "⚠️ Gia hạn thẻ"
- Thẻ "Đã hết hạn" có badge màu đỏ và nút "🔴 Gia hạn thẻ"

### Bước 3: Mở modal gia hạn

- Click nút "Gia hạn thẻ"
- Modal hiển thị thông tin đầy đủ

### Bước 4: Chọn gói và xác nhận thanh toán

- Chọn gói gia hạn từ dropdown
- Xem preview ngày mới
- Check/uncheck "Đã thanh toán"

### Bước 5: Xác nhận

- Click "Xác nhận gia hạn"
- Thẻ được cập nhật ngay trong bảng
- Alert thông báo "Gia hạn thẻ thành công!"

## 🔒 Security & Validation

### Backend

- ✅ `verifyToken` - Xác thực user đã login
- ✅ `verifyAdmin` - Chỉ admin mới được phép
- ✅ Kiểm tra membership tồn tại
- ✅ Không cho gia hạn thẻ đã hủy
- ✅ MongoDB transaction để đảm bảo data integrity

### Frontend

- ✅ JWT token validation
- ✅ jwtDecode kiểm tra role
- ✅ UI conditional rendering dựa trên status
- ✅ Client-side validation trước khi gọi API

## 🎨 UI/UX Features

### Visual Indicators

- **Badge "Sắp hết hạn":** Màu vàng-cam với icon ⚠️
- **Badge "Đã hết hạn":** Màu đỏ
- **Nút gia hạn:** Highlight với font-semibold khi urgent
- **Modal:** Design thống nhất với dashboard, responsive

### User Feedback

- Preview rõ ràng trước khi xác nhận
- Alert success/error
- Real-time update bảng sau khi gia hạn
- Format date và price theo chuẩn VN

## 🧪 Testing

### Manual Testing Checklist

- [ ] Gia hạn thẻ đang hoạt động (còn hạn)
- [ ] Gia hạn thẻ sắp hết hạn (≤7 ngày)
- [ ] Gia hạn thẻ đã hết hạn
- [ ] Thử gia hạn thẻ đã hủy (phải fail)
- [ ] Test với paymentStatus = true
- [ ] Test với paymentStatus = false
- [ ] Test tất cả các gói (monthly, quarterly, annual)
- [ ] Kiểm tra tính toán ngày đúng
- [ ] Kiểm tra badge cập nhật sau gia hạn

### Automated Testing

Sử dụng script test:

```bash
node backend/test-membership-renewal.js
```

## 🐛 Known Issues & Limitations

### Current Limitations

1. Không có history log cho gia hạn (có thể thêm sau)
2. Không có email notification sau gia hạn
3. Không có discount/promotion logic

### Future Enhancements

- [ ] Auto-renewal option
- [ ] Email notification
- [ ] SMS notification
- [ ] History log với timestamp
- [ ] Discount codes
- [ ] Bulk renewal cho nhiều thẻ cùng lúc

## 📚 API Reference

### POST /api/memberships/renew/:id

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**URL Parameters:**

- `id` (string, required) - Membership ID

**Request Body:**

```json
{
  "type": "string (required)", // Loại gói mới
  "price": "number (required)", // Giá gói
  "paymentStatus": "boolean (optional, default: false)" // Trạng thái thanh toán
}
```

**Success Response (200):**

```json
{
  "message": "Gia hạn thẻ thành viên thành công",
  "membership": {
    /* Updated membership object */
  }
}
```

**Error Responses:**

- `404` - Không tìm thấy thẻ thành viên
- `400` - Không thể gia hạn thẻ đã hủy
- `401` - Unauthorized
- `403` - Forbidden (không phải admin)
- `500` - Server error

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:

1. Check console.log trong browser DevTools
2. Check server logs
3. Verify token và permissions
4. Kiểm tra database connection

---

**Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Author:** Admin Team
