1. Ở src/pages/forgot-password.jsx, người dùng chỉ nhập email rồi bấm gửi. Frontend gọi forgotPasswordApi(email) trong src/util/app.js.

2. Backend ở src/services/userService.js sẽ kiểm tra email có tồn tại không, tạo reset token bằng JWT, rồi gửi mail chứa link dạng /reset-password?token=... qua Nodemailer. Nếu chưa cấu hình SMTP thật thì dùng Ethereal preview.

3. Sau khi mở link trong mail, người dùng vào src/pages/reset-password.jsx, nhập mật khẩu mới. Frontend gọi resetPasswordApi(token, newPassword) và backend xác thực token rồi hash mật khẩu mới để update DB.