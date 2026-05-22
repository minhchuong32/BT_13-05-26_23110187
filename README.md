# Tài Liệu Mô Tả Logic Dự Án

Đây là một ứng dụng Full-Stack gồm ReactJS ở frontend và ExpressJS + MySQL ở backend. Mục tiêu của dự án là mô phỏng một website bán hàng có xác thực người dùng, khôi phục mật khẩu bằng OTP và duyệt sản phẩm theo danh mục, bộ lọc, trang chi tiết.

## 1. Kiến Trúc Tổng Quan

Hệ thống được chia thành 2 phần:

- Frontend: xử lý giao diện, điều hướng trang, gọi API và lưu trạng thái đăng nhập.
- Backend: cung cấp API, xác thực token, truy vấn dữ liệu từ MySQL và xử lý nghiệp vụ.

Luồng dữ liệu đi theo hướng:

1. Người dùng thao tác trên React.
2. Frontend gọi các API trong `ExpressJS01_Backend`.
3. Backend xử lý logic ở controller/service.
4. Dữ liệu trả về cho frontend để render lại giao diện.

## 2. Luồng Xác Thực Người Dùng

### 2.1. Đăng ký tài khoản

Trang đăng ký nằm ở `ReactJS_Frontend/src/pages/register.jsx`.

- Người dùng nhập `name`, `email`, `password`.
- Frontend gọi `POST /v1/api/register`.
- Backend đi vào `createUser` trong `userController`, sau đó gọi `createUserService`.
- Service kiểm tra email đã tồn tại chưa.
- Nếu chưa có, mật khẩu được hash bằng `bcrypt` trước khi lưu vào bảng `users`.
- Tài khoản mới được lưu với role mặc định là `User`.

Ý nghĩa logic của bước này là không lưu mật khẩu dạng thô và ngăn đăng ký trùng email.

### 2.2. Đăng nhập

Trang đăng nhập nằm ở `ReactJS_Frontend/src/pages/login.jsx`.

- Người dùng nhập `email` và `password`.
- Frontend gọi `POST /v1/api/login`.
- Backend tìm user theo email, sau đó so sánh mật khẩu bằng `bcrypt.compare`.
- Nếu hợp lệ, backend tạo JWT bằng `jsonwebtoken`.
- Token trả về frontend cùng thông tin `email` và `name` của người dùng.
- Frontend lưu `access_token` vào `localStorage` và cập nhật `AuthContext`.

Từ thời điểm này, các request về sau sẽ tự gắn header `Authorization: Bearer <token>` nhờ interceptor trong `ReactJS_Frontend/src/util/axios.customize.js`.

### 2.3. Tải lại trạng thái đăng nhập

Khi ứng dụng mở lại, `ReactJS_Frontend/src/App.jsx` gọi `GET /v1/api/account` để kiểm tra người dùng còn hợp lệ hay không.

- Nếu token còn hiệu lực, backend trả lại thông tin `req.user`.
- Frontend dùng dữ liệu này để xem người dùng đã đăng nhập hay chưa.

Điểm này giúp giữ trạng thái đăng nhập sau khi reload trang.

### 2.4. Bảo vệ route bằng middleware

Backend dùng middleware `auth` trong `ExpressJS01_Backend/src/middleware/auth.js`.

- Một số route được cho phép truy cập công khai như `/register`, `/login`, `/forgot-password`, `/reset-password`, `/products`, `/categories` và `/products/:id`.
- Các route còn lại bắt buộc phải có token hợp lệ.
- Nếu token hợp lệ, middleware giải mã JWT và gắn thông tin vào `req.user`.
- Nếu token sai hoặc hết hạn, API trả lỗi `401`.

Logic này giúp phân tách rõ route công khai và route cần xác thực.

## 3. Luồng Khôi Phục Mật Khẩu

### 3.1. Gửi OTP khi quên mật khẩu

Trang quên mật khẩu nằm ở `ReactJS_Frontend/src/pages/forgot-password.jsx`.

- Người dùng nhập email đã đăng ký.
- Frontend gọi `POST /v1/api/forgot-password`.
- Backend kiểm tra email có tồn tại trong bảng `users` hay không.
- Nếu tồn tại, backend tạo OTP 6 chữ số và sinh thêm `resetToken` chứa `email`, `otp`, `purpose`.
- OTP được gửi qua email bằng `nodemailer`.
- Backend trả về `resetToken`; frontend lưu token này vào `localStorage` để dùng cho bước reset.

Nếu không có cấu hình mail thật, backend tự tạo test account để vẫn có thể kiểm tra luồng gửi mail.

### 3.2. Đặt lại mật khẩu

Trang đặt lại mật khẩu nằm ở `ReactJS_Frontend/src/pages/reset-password.jsx`.

- Người dùng nhập `email`, `otp`, `newPassword`.
- Frontend lấy `resetToken` đã lưu trước đó trong `localStorage`.
- Frontend gọi `POST /v1/api/reset-password`.
- Backend giải mã token, kiểm tra `purpose`, kiểm tra email và OTP có khớp hay không.
- Nếu hợp lệ, mật khẩu mới được hash bằng `bcrypt` rồi cập nhật vào database.
- Sau khi đổi xong, frontend xóa `resetToken` và `resetEmail`, rồi điều hướng về trang đăng nhập.

Luồng này đảm bảo chỉ người có email nhận OTP mới đổi được mật khẩu.

## 4. Luồng Sản Phẩm

### 4.1. Trang chủ

Trang chủ nằm ở `ReactJS_Frontend/src/pages/home.jsx`.

- Khi trang mở, frontend gọi 3 request song song:
  - `GET /v1/api/products?type=newest`
  - `GET /v1/api/products?type=bestseller`
  - `GET /v1/api/products?type=promotion`
- Dữ liệu trả về được chia thành 3 khối hiển thị: sản phẩm mới, bán chạy và khuyến mãi.

Backend dùng `getProductsService` để build câu SQL động theo query parameters.

### 4.2. Tìm kiếm và lọc sản phẩm

Trang tìm kiếm nằm ở `ReactJS_Frontend/src/pages/search.jsx`.

Frontend có thể gửi các tham số sau:

- `search` hoặc `q`: từ khóa tên sản phẩm.
- `category`: lọc theo danh mục.
- `minPrice`, `maxPrice`: lọc theo khoảng giá.
- `sort`: sắp xếp giá tăng hoặc giảm.
- `type`: lọc theo `promotion` hoặc `bestseller`.

Backend đọc các query này trong `getProductsService`, ghép điều kiện vào SQL và trả danh sách phù hợp.

Logic này giúp trang search vừa linh hoạt vừa tái sử dụng cùng một endpoint cho nhiều kiểu lọc khác nhau.

### 4.3. Xem chi tiết sản phẩm

Trang chi tiết nằm ở `ReactJS_Frontend/src/pages/product-detail.jsx`.

- Khi người dùng bấm vào một sản phẩm, frontend gọi `GET /v1/api/products/:id`.
- Backend lấy dữ liệu sản phẩm theo ID.
- Ngoài thông tin chính, backend còn lấy thêm 4 sản phẩm cùng danh mục để hiển thị phần “sản phẩm tương tự”.
- Frontend dùng Swiper để render thư viện ảnh và hiển thị mô tả, giá, tồn kho, số lượng đã bán.

### 4.4. Danh mục sản phẩm

Frontend gọi `GET /v1/api/categories` để lấy danh sách danh mục.

- Danh mục được dùng cho bộ lọc ở trang search.
- Dữ liệu này cũng giúp người dùng chuyển nhanh từ sản phẩm sang nhóm sản phẩm liên quan.

## 5. Luồng Lấy Thông Tin Người Dùng

Trang `ReactJS_Frontend/src/pages/user.jsx` gọi `GET /v1/api/user`.

- API này yêu cầu token hợp lệ.
- Nếu hợp lệ, backend trả danh sách user từ bảng `users`.
- Frontend hiển thị dữ liệu dạng bảng.

Đây là ví dụ cho nhóm route chỉ hoạt động khi đã đăng nhập.

## 6. Tóm Tắt API Chính

- `POST /v1/api/register`: tạo tài khoản mới.
- `POST /v1/api/login`: đăng nhập và nhận JWT.
- `GET /v1/api/account`: kiểm tra tài khoản đang đăng nhập.
- `GET /v1/api/user`: lấy danh sách user.
- `POST /v1/api/forgot-password`: tạo OTP và gửi mail.
- `POST /v1/api/reset-password`: xác minh OTP và đổi mật khẩu.
- `GET /v1/api/products`: lấy danh sách sản phẩm, hỗ trợ tìm kiếm và lọc.
- `GET /v1/api/products/:id`: lấy chi tiết sản phẩm.
- `GET /v1/api/categories`: lấy danh sách danh mục.

## 7. Kết Luận

Dự án tập trung vào 3 luồng chính: xác thực người dùng, khôi phục mật khẩu và duyệt sản phẩm. Backend xử lý nghiệp vụ bằng controller/service rõ ràng, còn frontend giữ vai trò điều hướng, gọi API và render giao diện theo dữ liệu trả về.

Nếu cần, có thể bổ sung tiếp phần cài đặt, cách chạy dự án, hoặc sơ đồ luồng request để README đầy đủ hơn.
