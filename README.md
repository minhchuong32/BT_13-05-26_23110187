# Tài Liệu Giải Thích Luồng Hoạt Động Của Hệ Thống

Dự án này là một ứng dụng Full-Stack (ReactJS Frontend + ExpressJS Backend) bao gồm các chức năng cốt lõi của một hệ thống thương mại điện tử cơ bản và quản lý xác thực người dùng.

Dưới đây là giải thích chi tiết về luồng hoạt động logic của các chức năng chính trong hệ thống.

## 1. Luồng Xác thực và Quản lý Người dùng (Authentication)

### 1.1. Đăng ký tài khoản (Register)
*   **Frontend (`/register`):** Người dùng nhập thông tin đăng ký (Tên, Email, Mật khẩu) trên giao diện. Frontend gửi một yêu cầu `POST /register` kèm theo dữ liệu người dùng đến Backend.
*   **Backend (`userController.createUser`):** 
    *   Tiếp nhận yêu cầu, kiểm tra dữ liệu đầu vào.
    *   Mã hóa (hash) mật khẩu bằng thư viện `bcrypt` để đảm bảo bảo mật.
    *   Lưu thông tin người dùng mới vào cơ sở dữ liệu.
    *   Trả về phản hồi thành công cho Frontend.

### 1.2. Đăng nhập (Login)
*   **Frontend (`/login`):** Người dùng nhập Email và Mật khẩu. Frontend gửi yêu cầu `POST /login` đến Backend.
*   **Backend (`userController.handleLogin`):**
    *   Tìm kiếm người dùng theo Email trong Database.
    *   Sử dụng `bcrypt` để so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa lưu trong Database.
    *   Nếu khớp, Backend sẽ tạo ra một chuỗi token (Access Token) bằng `jsonwebtoken` chứa thông tin định danh của người dùng.
    *   Trả token này về cho Frontend.
*   **Frontend:** Nhận token và lưu trữ (thường là trong Local Storage hoặc Cookies) để đính kèm vào các yêu cầu cần xác thực sau này.

### 1.3. Lấy thông tin tài khoản (Protected Routes)
*   **Frontend:** Khi cần lấy thông tin người dùng (ví dụ trang Profile - `/user` hoặc `/account`), Frontend gửi yêu cầu `GET` kèm theo Access Token trong Header (thường là `Authorization: Bearer <token>`).
*   **Backend (`auth middleware`):** 
    *   Middleware `auth` sẽ chặn yêu cầu để kiểm tra tính hợp lệ của token trước khi cho phép đi tiếp vào Controller.
    *   Sử dụng `jsonwebtoken` để giải mã và xác minh token. Nếu token hợp lệ và chưa hết hạn, middleware sẽ cho phép yêu cầu đi tiếp.
*   **Backend (`userController.getUser` / `getAccount`):** Sau khi đi qua middleware thành công, trả về thông tin chi tiết của người dùng đang đăng nhập.

## 2. Luồng Khôi phục Mật khẩu (Password Recovery)

### 2.1. Quên mật khẩu - Gửi mã OTP
*   **Frontend (`/forgot-password`):** Người dùng nhập Email tài khoản đã quên mật khẩu. Gửi yêu cầu `POST /forgot-password`.
*   **Backend (`userController.forgotPassword`):**
    *   Kiểm tra Email có tồn tại trong hệ thống không.
    *   Tạo ra một mã OTP ngẫu nhiên (hoặc một token reset).
    *   Sử dụng thư viện gửi mail (ví dụ: `nodemailer`) để gửi mã OTP đến Email của người dùng.
    *   Lưu trữ mã OTP tạm thời (vào DB hoặc cache) kèm theo thời gian hết hạn để xác minh sau này.

### 2.2. Đặt lại mật khẩu - Xác minh OTP
*   **Frontend (`/reset-password`):** Người dùng nhập Email, mã OTP vừa nhận được, và Mật khẩu mới. Gửi yêu cầu `POST /reset-password`.
*   **Backend (`userController.resetPassword`):**
    *   Kiểm tra sự khớp nhau và tính hợp lệ của Email và mã OTP (OTP có đúng không, có bị hết hạn không).
    *   Nếu OTP hợp lệ, tiến hành mã hóa (`bcrypt`) Mật khẩu mới.
    *   Cập nhật mật khẩu mới cho người dùng trong Database.
    *   Xóa bỏ mã OTP vừa sử dụng để tránh việc có thể tái sử dụng.

## 3. Luồng Quản lý Sản phẩm (E-commerce)

### 3.1. Hiển thị danh sách và trang chủ
*   **Frontend (Trang chủ `home.jsx`):** Khi trang chủ được tải, Frontend sẽ gọi các API `GET /categories` và `GET /products` để lấy dữ liệu.
*   **Backend (`productController.getCategories` & `getProducts`):** 
    *   Truy vấn Database thông qua các Services (`productService`) để lấy danh sách các danh mục và tất cả sản phẩm (hoặc sản phẩm nổi bật).
    *   Trả dữ liệu về dạng JSON cho Frontend hiển thị lên giao diện dưới dạng danh sách hoặc slider ảnh.

### 3.2. Tìm kiếm và Lọc sản phẩm
*   **Frontend (Trang `search.jsx`):** Khi người dùng nhập từ khóa tìm kiếm hoặc chọn các bộ lọc (như danh mục, khoảng giá, sắp xếp theo giá...), Frontend sẽ gửi yêu cầu `GET /products` kèm theo các tham số (Query Parameters, ví dụ: `?search=giày&category=thể-thao&sort=price_asc`).
*   **Backend (`productController.getProducts`):**
    *   Đọc các tham số tìm kiếm/lọc từ yêu cầu (`req.query`).
    *   Tạo các điều kiện lọc linh hoạt và truyền xuống `productService`.
    *   Thực hiện truy vấn Database dựa trên các điều kiện này để lấy ra danh sách sản phẩm chính xác khớp với tiêu chí của người dùng.
    *   Trả kết quả tìm kiếm về cho Frontend để cập nhật lại danh sách.

### 3.3. Xem chi tiết sản phẩm
*   **Frontend (`product-detail.jsx`):** Khi người dùng nhấp vào xem một sản phẩm, Frontend lấy ID của sản phẩm đó và gửi yêu cầu `GET /products/:id`.
*   **Backend (`productController.getProductById`):**
    *   Lấy tham số ID từ URL (`req.params.id`).
    *   Truy vấn Database để lấy toàn bộ thông tin chi tiết của sản phẩm có ID tương ứng.
    *   Nếu không tìm thấy, trả về lỗi 404. Nếu tìm thấy, trả về dữ liệu (tên, giá, mô tả, hình ảnh...) để Frontend dựng lại giao diện chi tiết sản phẩm (hiển thị mô tả, slider hình ảnh chi tiết bằng Swiper,...).
