# Task Specification: UC-05 View Subscription (Fullstack)

Mô tả Use Case UC-05 hiển thị các Gói Dịch Vụ (Subscription Packages) dành cho người dùng (Guest).
Nhiệm vụ của bạn là triển khai tính năng này trên cả 2 hệ thống: **Imate-BackEnd** và **Imate-FrontEnd**.

## 1. Yêu cầu Backend (d:\Do An\Imate-BackEnd)

### Model & Entity
Cần đảm bảo có entity đại diện cho `SubscriptionPackage` trong `ImateDbContext`.
Các trường bắt buộc (dựa trên thiết kế):
- `Id` (GUID)
- `Name` (Tên gói, vd: Miễn phí, Pro, Premium)
- `Price` (Giá, vd: 0, 199000, 499000)
- `Duration` (Hạn dùng, vd: 1 month)
- `Benefits` (Danh sách các quyền lợi, có thể thiết kế dạng Enum List, JSON, hoặc bảng quan hệ 1-N `PackageBenefit`)
- `IsActive` (Trạng thái gói)
- `IsRecommended` (Gói khuyên dùng, vd gói Pro để hiển thị Badge)

### API Endpoint (Guest Access)
Cần tạo Controller `SubscriptionPackagesController` hoặc tích hợp vào một controller phù hợp ở tầng `Presentation`.
- **Endpoint:** `GET /api/subscription-packages`
- **Response Model (DTO):** Cần chứa tối thiểu các trường: `Id`, `Name`, `Price`, `Duration`, `Benefits` (List of strings), `IsRecommended`.
- **Logic:** Lấy các gói đang hoạt động ở database (`IsActive == true`), sắp xếp theo Price tăng dần (Miễn phí -> Pro -> Premium).
- **Security:** Endpoint này là public (AllowAnonymous) vì Guest cần xem được.
- **Quy chuẩn Code:** Áp dụng theo đúng `CLAUDE.md` của Backend. Ném exceptions qua Domain Exception nếu có lỗi, dùng `record` cho DTO, `.AsNoTracking()` khi query.

## 2. Yêu cầu Frontend (d:\Do An\Imate-FrontEnd\imate_frontend)

### Giao diện (Mockup/UI Design)
Dựa trên hình ảnh thiết kế tĩnh mà người dùng đã cung cấp, layout trang web cần đạt được các yếu tố:

**Tiêu đề trang (Header):**
- "Chọn gói dịch vụ phù hợp với bạn" (từ "phù hợp với bạn" có màu gradient xanh-tím nổi bật).
- Dòng chữ nhỏ bên dưới: "Bắt đầu hành trình chinh phục mọi cuộc phỏng vấn IT ngay hôm nay"

**Layout các gói (3 Cards):**

**Card 1: Miễn phí**
- Giá: `0đ /tháng`
- Quyền lợi (có icon checkmark xanh lá/xanh dương rỗng):
  - 3 lượt luyện tập AI/tháng
  - Xem ngân hàng câu hỏi cơ bản
- Nút bấm: "Bắt đầu ngay" (Ghost/Outline button)
- Phong cách background: Viền xám mờ, màu nền tối.

**Card 2: Pro (Gói được nổi bật nhất)**
- Có một cái Badge nổi lên nửa trên card ghi dòng chữ "KHUYÊN DÙNG" màu tím.
- Giá: `199.000đ /tháng`
- Quyền lợi (có icon checkmark tròn đầy/tím):
  - Luyện tập AI không giới hạn
  - Phản hồi chi tiết 1:1
  - Xem tất cả câu hỏi hệ thống
- Nút bấm: "Mua ngay" (Màu Gradient tím sáng).
- Phong cách background: Có hiệu ứng glow (tỏa sáng xỉn màu) ánh tím bao quanh outer-border để nhấn mạnh vào đây là gói chính.

**Card 3: Premium**
- Giá: `499.000đ /tháng`
- Quyền lợi (icon checkmark viền tím đầy):
  - Tất cả quyền lợi gói Pro
  - 2 buổi mentor mỗi tháng
  - Ưu tiên kết nối chuyên gia
- Nút bấm: "Mua ngay" (Solid button màu tím violet bình thường)
- Phong cách background: Viền sáng mờ, nền tối.

### Yêu cầu Kỹ Thuật (Frontend)
- **Data Fetching:** Sử dụng `@tanstack/react-query` gọi API `GET /api/subscription-packages` thông qua custom hook (e.g. `useSubscriptionPackages`). Định nghĩa call bằng `apiClient.ts` trong folder `src/services/`.
- **Navigation:**
  - Khai báo page path mới (vd: `/bang-gia` hoặc `/pricing`). Đưa vào mục `CommonRouter` tại `src/routes/index.tsx`.
  - Cập nhật file `src/constants/menu.ts` (mục "Bảng giá") dẫn về route này.
- **Quy chuẩn Code:** Áp dụng theo đúng `CLAUDE.md` của Frontend. Tận dụng class từ Tailwind CSS và các component có sẵn trong thư mục `ui`.

## 3. Hướng dẫn thực hiện (Dành cho Claude Code)

Xử lý từng hệ thống một:

**Bước 1: Hệ thống Backend**
1. Check file `CLAUDE.md` của Backend.
2. Thiết kế logic DB (Models, DTOs, EF Configs).
3. Viết Service và API Controllers. Chạy lệnh build kiểm tra thử.

**Bước 2: Hệ thống Frontend**
1. Check file `CLAUDE.md` của Frontend.
2. Thêm types/interfaces match với Backend DTO.
3. Cài đặt API Service (`src/services/`) và TanStack query cho component.
4. Xây dựng giao diện CSS/UI theo bản thiết kế. Đảm bảo UI khớp 99% theo màu sắc và spacing của mock-up.
5. Setup Router để truy cập.

Hãy lên outline, phân tích và thực thi từ từ qua nhiều tool calls. Trang thiết kế này là một trang public cực kỳ quan trọng về thẩm mỹ (Aesthetics). Phải dùng theme màu đẹp nhất.
