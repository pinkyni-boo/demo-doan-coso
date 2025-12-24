
## Tổng số chức năng chính của hệ thống: **12 chức năng**

1. Quản lý lớp học
2. Quản lý HLV
3. Quản lý học viên
4. Đăng ký lớp
5. Thanh toán
6. Điểm danh
7. Quản lý tài sản
8. Báo cáo sự cố
9. Quản lý bảo trì
10. Thống kê
11. Thông báo
12. Phản hồi

---

# Tóm tắt hệ thống code, logic chức năng, quy trình vận hành

Hệ thống được xây dựng theo mô hình Client-Server, sử dụng React cho frontend và Node.js/Express/MongoDB cho backend. Dữ liệu được quản lý qua các collection chính như User, Trainer, Class, ClassEnrollment, Attendance, Room, Equipment, IssueReport, MaintenanceSchedule, Payment, Notification, Feedback.

- **Frontend:** Chia component theo vai trò (Admin, Trainer, User), quản lý giao diện, routing, gọi API qua Axios, xử lý logic hiển thị, xác thực, phân quyền.
- **Backend:** Xây dựng RESTful API, xác thực JWT, phân quyền, xử lý nghiệp vụ qua controller, kiểm tra ràng buộc dữ liệu, bảo mật, quản lý file upload.

**Quy trình vận hành:**
1. Người dùng đăng nhập/đăng ký, nhận token xác thực.
2. Người dùng thao tác (đăng ký lớp, thanh toán, gửi báo cáo...), frontend gửi request kèm token.
3. Backend xác thực, kiểm tra quyền, xử lý logic, trả về dữ liệu.
4. Admin quản lý hệ thống, Trainer quản lý lớp mình dạy, User đăng ký lớp và các dịch vụ.
5. Hệ thống kiểm tra số lượng, trùng lịch, trạng thái lớp, trạng thái thẻ, trạng thái thanh toán, gửi thông báo tự động.
6. Dữ liệu được kiểm tra toàn vẹn, tránh trùng lặp, race condition, đảm bảo đúng nghiệp vụ.

**Logic code:**
- Sử dụng middleware xác thực, phân quyền, validate input.
- Controllers xử lý nghiệp vụ, gọi model, trả về response chuẩn hóa.
- Models định nghĩa schema, relationship, validation.
- Frontend quản lý state, gọi API, xử lý lỗi, loading, hiển thị thông báo.

**Tổng kết:**
Hệ thống đảm bảo đầy đủ chức năng nghiệp vụ, bảo mật, tối ưu hóa dữ liệu và trải nghiệm người dùng. Các chức năng chính đều được tách biệt rõ ràng, dễ mở rộng và bảo trì.
